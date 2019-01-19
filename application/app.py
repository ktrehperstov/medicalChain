import hmac
import hashlib
import json
from flask import Flask
from flask import request
import requests

app = Flask(__name__)

@app.route("/", methods=['GET', 'POST'])
def index():
    body = request.data
    signature = request.headers['x-pyrus-sig']
    secret = 'VBbaM5MwCIvKUNcIlZb4VmA2y6n3X2XytkHPDkL3AAmIsZn1x5iREHe-a9V-QMmwUZJTjgVRQ8e6fbmbJQ3Bpu7s96~uxGHT'
    return _prepare_response(body.decode('utf-8'))

def _prepare_response(body):
    task = json.loads(body)["task"]
    task_author = task["author"]["email"]
    res = requests.post('http://127.0.0.1:3000/tests/endpoint', json=task)
    print('response from server:',res.text)

    return "{{\"text\": \"Hello, {}. This task approved by bot.\", \"approval_choice\": \"approved\"}}".format(task_author)

if __name__ == "__main__":
    app.run("127.0.0.1", 80)
