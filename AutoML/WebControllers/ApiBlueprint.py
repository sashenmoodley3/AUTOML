from flask import Blueprint
from flask_restful import Api
from WebControllers.TrainController import TrainController
from WebControllers.TestController import TestController
from WebControllers.FileController import FileController

apiBP = Blueprint('api', __name__)
API = Api(apiBP)
API.add_resource(TrainController, '/train')
API.add_resource(TestController, '/test')
API.add_resource(FileController, '/files')
