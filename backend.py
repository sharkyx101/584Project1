from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from bson import ObjectId

app = Flask(__name__)
CORS(app)

# MongoDB configuration
app.config['MONGO_URI'] = 'mongodb://localhost:27017/tasks_comments'
mongo = PyMongo(app)

# API endpoints
@app.route('/tasks', methods=['GET', 'POST'])
def tasks():
    try:
        if request.method == 'GET':
            tasks = list(mongo.db.tasks.find().sort('order', 1))
            tasks = [{**task, '_id': str(task['_id'])} for task in tasks]
            return jsonify(tasks)

        elif request.method == 'POST':
            data = request.get_json()
            task_name = data['name']
            task_description = data['description']

            max_order_task = mongo.db.tasks.find_one(sort=[("order", -1)])
            max_order = max_order_task['order'] if max_order_task else 0
            new_order = max_order + 1

            mongo.db.tasks.insert_one({
                'name': task_name,
                'description': task_description,
                'order': new_order,
                'comments': []
            })

            return jsonify({'message': 'Task created successfully'}), 200, {'Access-Control-Allow-Origin': '*'}

    except Exception as e:
        print(e)
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500, {'Access-Control-Allow-Origin': '*'}

@app.route('/tasks/<ObjectId:task_id>', methods=['PUT'])
def update_task(task_id):
    try:
        data = request.get_json()
        new_name = data.get('name', '')
        new_description = data.get('description', '')
        new_order = data.get('order')

        if new_name or new_description:
            mongo.db.tasks.update_one(
                {'_id': task_id},
                {'$set': {'name': new_name, 'description': new_description}}
            )

        if new_order is not None:
            mongo.db.tasks.update_one(
                {'_id': task_id},
                {'$set': {'order': new_order}}
            )

        return jsonify({'message': 'Task updated successfully'}), 200, {'Access-Control-Allow-Origin': '*'}

    except Exception as e:
        print(e)
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500, {'Access-Control-Allow-Origin': '*'}

@app.route('/tasks/<ObjectId:task_id>/comments', methods=['POST'])
def add_comment(task_id):
    try:
        data = request.get_json()
        new_comment = data['comment']

        mongo.db.tasks.update_one(
            {'_id': task_id},
            {'$push': {'comments': new_comment}}
        )

        return jsonify({'message': 'Comment added successfully'}), 200, {'Access-Control-Allow-Origin': '*'}

    except Exception as e:
        print(e)
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500, {'Access-Control-Allow-Origin': '*'}

# Run the app
if __name__ == '__main__':
    app.run(debug=True)
