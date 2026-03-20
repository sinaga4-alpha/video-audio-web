from flask import Flask, render_template
from flask_socketio import SocketIO, emit, join_room

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins='*')

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('join')
def on_join(data):
    room = data['room']
    join_room(room)
    print(f'User joined room: {room}')
    
@socketio.on('offer')
def handle_offer(data):
    room = data['room']
    emit('offer', data['offer'], room=room, include_self=False)
    
@socketio.on('answer')
def handle_answer(data):
    room = data['room']
    emit('answer', data['answer'], room=room, include_self=False)
    
@socketio.on('ice-candidate')
def handle_ice(data):
    room = data['room']
    emit('ice-candidate', data['candidate'], room=room, include_self=False)
    
if __name__ == '__main__':
    socketio.run(app)