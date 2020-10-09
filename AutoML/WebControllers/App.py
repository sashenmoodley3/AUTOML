from WebControllers.ApiBlueprint import apiBP
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
app.register_blueprint(apiBP, url_prefix='/')
CORS(app)

if __name__ == '__main__':
    app.run(debug=True)
