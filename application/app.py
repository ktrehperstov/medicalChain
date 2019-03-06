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
    json_object = json.loads(body)
    
    #задача из Pyrus подлежащая сохранению
    task = json_object["task"]

    #id бота обрабатывающего запрос
    user_id = json_object["user_id"]

    #отбор нужных полей задачи для сохранения + id бота
    clinicalRecord = {
        "task": {
            "id": task["id"],
            "text": task["text"],
            "create_date": task["create_date"],
            "last_modified_date": task["last_modified_date"],
            "author": task["author"],
            "form_id": task["form_id"],
            "fields": task["fields"]
        },
        "user_id": user_id
    }

    task_author = task["author"]["email"]
    res = requests.post('http://127.0.0.1:3000/tests/endpoint', json=clinicalRecord)

    print('response from server:',res.text)
    return "{{\"text\": \"{}\"}}".format(res.text)

if __name__ == "__main__":
    app.run("127.0.0.1", 80)
