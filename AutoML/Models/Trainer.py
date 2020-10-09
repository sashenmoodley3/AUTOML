import time
from collections import defaultdict

import pandas as pd
from h2o.automl import H2OAutoML
import numpy as np
import matplotlib.pyplot as plt
import h2o

pd.options.display.max_rows = 999


class Model:
    def __init__(self):
        self.dataframe = None

    def getDataset(self, jsonData):
        self.filename = jsonData["FileName"]
        # self.dataframe = pd.read_csv("C:\\\Users\\\Kalin Pather\\\Downloads\\" + self.filename )
        self.dataframe = pd.read_csv("C:\\Users\\SMoodley\\Downloads\\" + self.filename)
        print(self.dataframe.head())

    def train(self, jsonData):
        self.predictionClass = jsonData["PredColumn"]
        self.modelID = jsonData["ModelName"]
        self.trainTime = int(jsonData["TrainTime"])

        h2o.init()

        h2o_df = h2o.H2OFrame(self.dataframe)

        print(h2o_df.describe())

        train, test = h2o_df.split_frame(ratios=[.75])

        x = train.columns
        y = self.predictionClass
        x.remove(y)

        aml = H2OAutoML(max_runtime_secs=self.trainTime,
                        # exclude_algos=['DeepLearning'],
                        seed=1,
                        # stopping_metric='logloss',
                        # sort_metric='logloss',
                        balance_classes=False,
                        project_name='Completed'
                        )

        aml.model_id = self.modelID
        start = time.time()
        aml.train(x=x, y=y, training_frame=train)
        end = time.time()
        print(end - start)

        lb = aml.leaderboard
        print(lb.head(rows=lb.nrows))
        aml.download_mojo(path="C:\\Users\\SMoodley\\PycharmProjects\\AutoML\\TempM\\" + self.modelID + ".zip")
        #aml.download_mojo(path="C:\\Users\\Kalin Pather\\PycharmProjects\\AutoML\\TempM\\" + self.modelID + ".zip")
        # model = h2o.get_model(aml.model_id)

    def test(self, jsonData):
        self.modelID = jsonData["ModelName"]
        self.filename = jsonData["FileName"]
        h2o.init()
        model = h2o.import_mojo("C:\\Users\\SMoodley\\PycharmProjects\\AutoML\\TempM\\" + self.modelID)
        #model = h2o.import_mojo("C:\\Users\\Kalin Pather\\PycharmProjects\\AutoML\\TempM\\" + self.modelID)
        print("Loaded Model")
        self.dataframe = pd.read_csv("C:\\Users\\SMoodley\\Downloads\\" + self.filename)
        #self.dataframe = pd.read_csv("C:\\Users\\Kalin Pather\\Downloads\\" + self.filename)
        h2o_df = h2o.H2OFrame(self.dataframe)
        print("Loaded data")
        print("Got predictions")
        predictions = model.predict(h2o_df)
        predictions = h2o.as_list(predictions, use_pandas=False)
        arr = []
        for i in range(1, len(predictions)):
            arr.append(predictions[i][0])
        # print(arr)
        response = defaultdict(list)
        response["predictions"].append(list(map(str, arr)))
        print("Response")
        print(response)
        return response

# model = Model()
# model.getDataset()
# model.train()

# data_df = pd.read_csv("C:\\Users\\Kalin Pather\\PycharmProjects\\AutoML\\IrisDataset\\data\\iris_csv.csv")
# print(data_df.head())
#
# h2o.init()
#
# h2o_df = h2o.H2OFrame(data_df)
#
# print(h2o_df.describe())
#
# train, test = h2o_df.split_frame(ratios=[.75])
#
# x = train.columns
# y = "class"
# x.remove(y)
#
# aml = H2OAutoML(max_runtime_secs=600,
#                 # exclude_algos=['DeepLearning'],
#                 seed=1,
#                 # stopping_metric='logloss',
#                 # sort_metric='logloss',
#                 balance_classes=False,
#                 project_name='Completed'
#                 )
#
# aml.model_id = 'irisModel'
# start = time.time()
# aml.train(x=x, y=y, training_frame=train)
# end = time.time()
# print(end - start)
#
# lb = aml.leaderboard
# print(lb.head(rows=lb.nrows))
# aml.download_mojo(path="C:\\Users\\Kalin Pather\\PycharmProjects\\AutoML\\")
# # lb.download_mojo(path="./")
# model = h2o.get_model(aml.model_id)
