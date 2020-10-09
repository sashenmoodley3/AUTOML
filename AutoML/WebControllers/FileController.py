from collections import defaultdict
from flask_restful import Resource
from flask import request
from os import listdir
from os.path import isfile, join


class FileController(Resource):

    def get(self):
        statusCode = 500
        # responseJson = None
        # jsonData = request.get_json(force=True)
        path = "C:\\Users\\SMoodley\\PycharmProjects\\AutoML\\TempM\\"
        # path = "C:\\Users\\Kalin Pather\\PycharmProjects\\AutoML\\TempM\\" #(Make the TempM folder Mr K)
        try:
            onlyfiles = [f for f in listdir(path) if isfile(join(path, f))]
            print("Here")
            print(onlyfiles)
            responseJson = defaultdict(list)
            responseJson["Filenames"].append(list(map(str, onlyfiles)))
            statusCode = 200
        except Exception as ex:
            print('Error: {}'.format(ex))
            responseJson = ex

        return responseJson, statusCode
