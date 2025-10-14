#!/usr/bin/env python3
"""
ZeroMQ 수신기
웹 인터페이스와 함께 제공
"""

import zmq
import cv2
import numpy as np
import json
import threading
from datetime import datetime
import time

# 최신 프레임
latest_frame = None
frame_lock = threading.Lock()

# 통계
frames_received = 0
start_time = datetime.now()


def zeromq_subscriber(zmq_address='tcp://localhost:5555', pattern='sub'):
    """ZeroMQ 구독자 스레드"""
    global latest_frame, frames_received
    
    # ZeroMQ 초기화
    context = zmq.Context()
    
    
    # 소켓 타입 결정
    if pattern == 'sub':
        socket = context.socket(zmq.SUB)
        socket.setsockopt(zmq.SUBSCRIBE, b'')  # 모든 메시지 구독
        pattern_name = 'SUB'
    elif pattern == 'pull':
        socket = context.socket(zmq.PULL)
        pattern_name = 'PULL'
    elif pattern == 'rep':
        socket = context.socket(zmq.REP)
        pattern_name = 'REP'
    else:
        raise ValueError(f'Invalid pattern: {pattern}')
    
    # 연결
    socket.connect(zmq_address)
    print(f'✓ ZeroMQ 연결: {zmq_address} ({pattern_name})')
    
    while True:
        try:
            # 멀티파트 메시지 수신
            parts = socket.recv_multipart()
            
            if len(parts) >= 2:
                # 메타데이터와 이미지 데이터
                metadata_json = parts[0]
                image_bytes = parts[1]
                
                # 메타데이터 파싱
                metadata = json.loads(metadata_json.decode('utf-8'))
                
                # 이미지 디코딩
                nparr = np.frombuffer(image_bytes, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                # 프레임 업데이트
                with frame_lock:
                    latest_frame = frame.copy()
                
                frames_received += 1
                
                # REP 패턴인 경우 응답 전송
                if pattern == 'rep':
                    socket.send_json({'status': 'ok', 'frame': frames_received})
            
        except zmq.ZMQError as e:
            print(f'ZeroMQ 오류: {e}')
            time.sleep(0.1)
        except Exception as e:
            print(f'프레임 처리 오류: {e}')