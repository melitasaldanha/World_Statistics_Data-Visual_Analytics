from flask import Flask, url_for
import json
from flask_cors import CORS
from flask import request
from flask import jsonify
import pandas as pd
import numpy as np
import random
from sklearn.utils import shuffle
from sklearn.cluster import KMeans
from scipy.spatial.distance import cdist
import matplotlib.pyplot as plt
import numpy.matlib as npm
from sklearn.decomposition import PCA
from sklearn import preprocessing
from sklearn.manifold import MDS
from sklearn.metrics.pairwise import euclidean_distances
from sklearn.preprocessing import LabelEncoder
from sklearn.pipeline import Pipeline
from sklearn import preprocessing

app = Flask(__name__)
cors = CORS(app)

############# Functions Defined ################

original_headers = []

data_complete = pd.DataFrame()
data_random = pd.DataFrame()
data_stratified = pd.DataFrame()
country_dict = {}

def makeCountryDict(country_name):
    global country_dict
    for i in range(len(country_name)):
        country_dict[i] = country_name[i]


def data_read(input_file):
    global original_headers
    df = pd.read_csv(input_file, header = 0)
    original_headers = list(df.columns.values)
    makeCountryDict(df.Country.unique())
    return df


def label_encoding(data):

    data_label_encoded = data.copy()

    cat_ft = data_label_encoded.dtypes==object
    cat_cols = data_label_encoded.columns[cat_ft].tolist()
    le = LabelEncoder()
    data_label_encoded[cat_cols] = data_label_encoded[cat_cols].apply(lambda col: le.fit_transform(col.astype(str)))

    return data_label_encoded


def getCountryNames(radioValue):

    country_names = []

    if(radioValue=="no"):
        country_names = list(country_dict.values())
    elif(radioValue=="random"):
        uniq_names = data_random.Country.unique()
        for i in range(len(uniq_names)):
            country_names.append(country_dict[i])
    else:
        uniq_names = set()
        for i in range(len(data_stratified)):
            val = data_stratified['Country'][i]
            uniq_names.add(country_dict[val])
        country_names = list(uniq_names)

    return country_names


def random_sampling(percentage):
    data = pd.DataFrame()
    country_list = list(data_complete.Country.unique())
    sampled_country_list = random.sample(country_list, int(len(country_list)*percentage/100))

    for index, row in data_complete.iterrows():
        if(row['Country'] in sampled_country_list):
            data = data.append(row, ignore_index=True)

    return data


def generate_elbow_data(data_as_np):

    sum_of_square_dist = []
    for i in range(2, 12):
        kmeans = KMeans(n_clusters = i, random_state = 0).fit(data_as_np)
        sum_of_square_dist.append((i, kmeans.inertia_/10000000))

    return sum_of_square_dist


def get_elbow_point(data_coors, n_vals):
    first_point = data_coors[0]
    last_point = data_coors[-1]
    lineVec = last_point - first_point
    lineVecNorm = lineVec / np.sqrt(np.sum(lineVec**2))
    vecFromFirst = data_coors - first_point

    scalarProduct = np.sum(vecFromFirst * npm.repmat(lineVecNorm, n_vals, 1), axis=1)
    vecFromFirstParallel = np.outer(scalarProduct, lineVecNorm)
    vecToLine = vecFromFirst - vecFromFirstParallel

    distToLine = np.sqrt(np.sum(vecToLine ** 2, axis=1))

    idxOfBestPoint = np.argmax(distToLine)
    return idxOfBestPoint


def stratified_sampling(percentage):

    # Group by Country
    col_list = data_complete.columns
    df_group = pd.DataFrame(columns=col_list)
    grp = data_complete.groupby('Country')
    for name, group in grp:
      mean = group.mean()
      df_group = df_group.append(pd.DataFrame([[name, mean[0], mean[1], mean[2], mean[3], mean[4], mean[5], mean[6], mean[7], mean[8], mean[9], mean[10], mean[11], mean[12], mean[13], mean[14], mean[15], mean[16]]], columns=col_list), ignore_index=True)

    # Stratified Sampling
    data_as_np = (df_group.groupby('Country').mean()).values
    sum_of_square_error_np = np.asarray(generate_elbow_data(data_as_np))

    idxOfBestPoint = get_elbow_point(sum_of_square_error_np, 10)
    optimal_k = int(sum_of_square_error_np[idxOfBestPoint][0])
    kmeans = KMeans(n_clusters = optimal_k, random_state = 0).fit(data_as_np)

    clusters = {}
    for i in range(len(kmeans.labels_)):
        try:
            clusters[kmeans.labels_[i]].append(i)
        except KeyError:
            clusters[kmeans.labels_[i]] = [i]

    stratified_samples = []
    for cluster in clusters.values():
        cluster = shuffle(cluster, n_samples=int((len(cluster)*percentage)/100), random_state = 0)
        stratified_samples += [data_as_np[i] for i in cluster]

    # Final DF based on Country Names sampled
    temp_df = pd.DataFrame(stratified_samples)
    new_df = pd.DataFrame()
    for i in range(len(temp_df)):
        new_df = new_df.append(data_complete[data_complete['Country'] == temp_df[0][i]], ignore_index=True)

    return new_df


def getDataForRadioButton(sampling):
    if(sampling == "no"):
        return data_complete
    elif(sampling == "random"):
        return data_random
    elif(sampling == "stratified"):
        return data_stratified


def compute_pca(data_values):
    df_norm = preprocessing.normalize(data_values)

    scaler = preprocessing.StandardScaler()
    df_scaled = scaler.fit_transform(data_values)

    pca = PCA()
    pca.fit(df_scaled)

    return pca


def generate_cumulative_data(pca):
    cumulative = []
    cum_var = np.cumsum(pca.explained_variance_ratio_)
    for i in range(0, len(cum_var)):
        cumulative.append([i, cum_var[i]])
    return cumulative


def gen_pca_variance_ratio_data(pca):
    evr = pca.explained_variance_ratio_[:18]
    coors = [[i+1, evr[i]] for i in range(len(evr))]
    return coors


def find_intrinsic_dim(pca):
    # uses elbow method
    variance_ratio = pca.explained_variance_ratio_[:18]
    coors_for_elbow = np.asarray([[i+1, variance_ratio[i]] for i in range(18)])
    intrinsic_dim_idx = get_elbow_point(coors_for_elbow, 18)
    return intrinsic_dim_idx


def compute_pca_loadings(pca):
    df_pca_components = pd.DataFrame(pca.components_[0:3].T, columns =["PC1","PC2","PC3"])
    pca_loadings = df_pca_components.values * np.sqrt(pca.explained_variance_ratio_[0:3])
    return pca_loadings


def compute_top_k_pca_loadings(pca_loadings, k):
    sum_sqr_pca_loadings = [(i, sum(j**2 for j in pca_loadings[i])) for i in range(len(pca_loadings))]
    sum_sqr_pca_loadings.sort(key=lambda x: x[1])
    top_k_pca_loadings = sum_sqr_pca_loadings[::-1][:k]
    top_k_pca_loadings_names = [original_headers[i[0]] for i in top_k_pca_loadings]
    return top_k_pca_loadings_names

def get_coors_pca_scatterPlot(data_values, top2_pca_vectors):
    scatterplot_data = np.matmul(data_values, top2_pca_vectors)
    x = scatterplot_data[:, 0]
    y = scatterplot_data[:, 1]
    coors=[[x[i], y[i]]for i in range(len(x))]
    return coors


def get_dist(data_values, distance):
    df_norm = preprocessing.normalize(data_values)

    scaler = preprocessing.StandardScaler()
    df_scaled = scaler.fit_transform(data_values)

    mds = MDS(n_components=2)

    if(distance=="Correlation"):
        distance = np.corrcoef(df_scaled)
    else:
        distance = euclidean_distances(df_scaled)

    m = mds.fit_transform(distance)
    x = m[:, 0]
    y = m[:, 1]
    coors=[[x[i], y[i]]for i in range(len(x))]
    return coors


def draw_scatter_matrix(data, top3_pca_names):
    res = { top3_pca_names[0]:data[top3_pca_names[0]].values.tolist(),
            top3_pca_names[1]:data[top3_pca_names[1]].values.tolist(),
            top3_pca_names[2]:data[top3_pca_names[2]].values.tolist()}
    return res


################### Requests ###################

@app.route('/', methods=['GET', 'POST'])
def getData():

    global data_complete, data_random, data_stratified

    # Original Data
    data = data_read("data/Final_Dataset_Shortened.csv")
    data_complete = label_encoding(data)
    n = len(data_complete)

    # Random Sampling Data
    data_random = random_sampling(25)

    # Stratified Sampling Data
    data_stratified = stratified_sampling(25)

    return jsonify({"len":n})


@app.route('/getMapData', methods=['GET', 'POST'])
def getMapData():

    country_list = getCountryNames((request.get_json())['radioValue'])
    return jsonify({"sampled_countries":country_list})


@app.route('/getElbowData', methods=['GET', 'POST'])
def getElbowData():

    elbow_data = generate_elbow_data(data_stratified)
    idx_knee_point = get_elbow_point(np.asarray(elbow_data), len(elbow_data))

    res = []
    for d in elbow_data:
        res.append({'k':d[0], 'sum_of_sqr_dist':d[1]})

    return jsonify({"elbow_data":res, "knee":str(idx_knee_point)})

@app.route('/getDimensions', methods=['GET', 'POST'])
def getDimensions():

    data = getDataForRadioButton((request.get_json())['radioValue'])

    pca = compute_pca(data.values)
    intrinsic_dim = find_intrinsic_dim(pca)
    pca_loadings = compute_pca_loadings(pca)
    selected_dimensions = compute_top_k_pca_loadings(pca_loadings, intrinsic_dim+1)

    return jsonify({"dimensions":selected_dimensions})



@app.route('/getScreeData', methods=['GET', 'POST'])
def getScreeData():

    data = getDataForRadioButton((request.get_json())['radioValue'])

    pca = compute_pca(data.values)
    cumulative = generate_cumulative_data(pca)
    var_ret = gen_pca_variance_ratio_data(pca)
    intrinsic_dim = find_intrinsic_dim(pca)
    pca_loadings = compute_pca_loadings(pca)
    top3_pca_loadings_names = compute_top_k_pca_loadings(pca_loadings, 3)

    res_c = []
    for d in cumulative:
        res_c.append({'p':d[0], 'cum':d[1]*100})

    res_v = []
    for d in var_ret:
        res_v.append({'p':d[0], 'rat':d[1]*100})

    return jsonify({"cumulative":res_c, "var_rat":res_v, "intr_dim_idx":str(intrinsic_dim), "top3pca":top3_pca_loadings_names})


@app.route('/PCA_Top2', methods=['GET', 'POST'])
def PCA_Top2():

    data = getDataForRadioButton((request.get_json())['radioValue'])

    pca = compute_pca(data.values)
    pca_loadings = compute_pca_loadings(pca)
    top2_pca_vectors = np.delete(np.asarray(pca_loadings), [2], 1)
    coors = get_coors_pca_scatterPlot(data.values, top2_pca_vectors)
    coors_l = [{'x':i[0], 'y':i[1]} for i in coors]

    return jsonify({"pca_scatter_data":coors_l})


@app.route('/MDS_Distance', methods=['GET', 'POST'])
def MDS_Distance():

    data = getDataForRadioButton((request.get_json())['radioValue'])

    distance = ((request.get_json())['currentTabName']).split()[2]
    coors = get_dist(data.values, distance)

    coors_l = [{'x':i[0], 'y':i[1]} for i in coors]

    return jsonify({"data": coors_l})


@app.route('/PCA_Top3', methods=['GET', 'POST'])
def PCA_Top3():

    data = getDataForRadioButton((request.get_json())['radioValue'])

    pca = compute_pca(data.values)
    pca_loadings = compute_pca_loadings(pca)
    top3_pca_loadings_names = compute_top_k_pca_loadings(pca_loadings, 3)
    sc_mat = draw_scatter_matrix(data, top3_pca_loadings_names)

    p1 = sc_mat[top3_pca_loadings_names[0]]
    p2 = sc_mat[top3_pca_loadings_names[1]]
    p3 = sc_mat[top3_pca_loadings_names[2]]
    res = [{top3_pca_loadings_names[0]:p1[i],
            top3_pca_loadings_names[1]:p2[i],
            top3_pca_loadings_names[2]:p3[i]}
            for i in range(len(p1))]

    return jsonify({"scatter_matrix":res})


if __name__ == '__main__':
    print("Listening...")
    app.run(host='0.0.0.0')
