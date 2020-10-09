from flask_restful import Resource
from flask import request
from Models.Trainer import Model
import threading


class TrainController(Resource):

    def post(self):
        statusCode = 500
        responseJson = None
        jsonData = request.get_json(force=True)

        try:
            # Get CSV file here and send to h20 for training
            newModel = Model()
            newModel.getDataset(jsonData)
            trainThread = threading.Thread(target=newModel.train, name="Trainer", args=[jsonData])
            trainThread.start()
            # newModel.train()
            responseJson = "Model training in progress; we'll email you when it is done!"
            statusCode = 200
        except Exception as ex:
            print('Error: {}'.format(ex))
            responseJson = ex

        return responseJson, statusCode
