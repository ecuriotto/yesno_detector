from flask import render_template
from flask import Flask
from flask_cors import CORS
app = Flask(__name__)
#cors = CORS(app)
# local modules
import config


# Get the application instance
connex_app = config.connex_app

# Read the swagger.yml file to configure the endpoints
connex_app.add_api("swagger.yml")
CORS(connex_app.app)

# Create a URL route in our application for "/"
@connex_app.route('/')
def home():
    """
    This function just responds to the browser ULR
    localhost:5000/

    :return:        the rendered template 'home.html'
    """
    #return 'Hey, we have Flask in a Docker container!'
    return render_template('home.html')

# If we're running in stand alone mode, run the application
if __name__ == '__main__':
    connex_app.run(host='0.0.0.0', port=5000, debug=True)