from flask import Flask, render_template, Response
import threading
import time
from datetime import datetime
import cv2

# zeromq_receiver 모듈 전체를 import (변수 참조 문제 해결)
import zeromq_receiver as zmq_recv

app = Flask(__name__)

# ZeroMQ 구독자 스레드 시작
def start_zeromq_receiver():
    """ZeroMQ 수신기를 백그라운드 스레드로 시작"""
    subscriber_thread = threading.Thread(
        target=zmq_recv.zeromq_subscriber,
        args=('tcp://localhost:5555', 'sub'),  # 기본값 사용
        daemon=True
    )
    subscriber_thread.start()
    print('✓ ZeroMQ 수신 스레드 시작됨')

@app.route('/')
def index():
    """메인 대시보드 페이지"""
    return render_template('dashboard.html')

@app.route('/api/status')
def status():
    """시스템 상태 API"""
    return {
        'status': 'running',
        'message': 'Dashboard is operational'
    }

@app.route('/video_feed')
def video_feed():
    """ZeroMQ로부터 받은 비디오 스트림"""
    def generate():
        while True:
            with zmq_recv.frame_lock:
                if zmq_recv.latest_frame is not None:
                    _, buffer = cv2.imencode('.jpg', zmq_recv.latest_frame,
                                            [cv2.IMWRITE_JPEG_QUALITY, 90])
                    frame_bytes = buffer.tobytes()
                    
                    yield (b'--frame\r\n'
                           b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            
            time.sleep(0.033)  # ~30 FPS
    
    return Response(generate(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/stream_stats')
def stream_stats():
    """스트림 통계 정보"""
    uptime = str(datetime.now() - zmq_recv.start_time).split('.')[0]
    return {
        'frames_received': zmq_recv.frames_received,
        'uptime': uptime,
        'has_frame': zmq_recv.latest_frame is not None
    }

if __name__ == '__main__':
    # Flask 서버 시작 전에 ZeroMQ 수신기 시작
    start_zeromq_receiver()
    
    print('='*60)
    print('통합 대시보드 시작')
    print('='*60)
    print('Web: http://0.0.0.0:5001/')
    print('Video Feed: http://0.0.0.0:5001/video_feed')
    print('='*60)
    
    app.run(host='0.0.0.0', port=5001, debug=False, threaded=True)
