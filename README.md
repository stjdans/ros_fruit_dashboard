# Fruit Dashboard

Flask 기반 비디오 스트리밍 대시보드 애플리케이션입니다. ZeroMQ를 통해 실시간 비디오 프레임을 수신하고 웹 인터페이스로 표시합니다.

## 필요한 패키지

- Flask
- OpenCV (cv2)
- ZeroMQ
- NumPy

### 설치 명령어

```bash
pip install flask
pip install opencv-python
pip install pyzmq
pip install numpy
```

또는 한 번에 설치:

```bash
pip install flask opencv-python pyzmq numpy
```

또는 requirements.txt 사용:

```bash
pip install -r requirements.txt
```

## 실행 방법
### 1. 애플리케이션 실행

```bash
python app.py
```

또는

```bash
python -m flask run --host=0.0.0.0 --port=5001
```

## 로컬 호스트 주소

애플리케이션 실행 후 다음 주소로 접속할 수 있습니다:

### 메인 페이지
- `http://localhost:5001/`
- `http://127.0.0.1:5001/`
- `http://0.0.0.0:5001/`

### API 엔드포인트

| 엔드포인트 | 설명 | URL |
|-----------|------|-----|
| 메인 대시보드 | 대시보드 UI | `http://localhost:5001/` |
| 시스템 상태 | 상태 확인 API | `http://localhost:5001/api/status` |
| 비디오 스트림 | 실시간 비디오 피드 | `http://localhost:5001/video_feed` |
| 스트림 통계 | 통계 정보 API | `http://localhost:5001/api/stream_stats` |

## 주의사항

- 애플리케이션은 **포트 5001**에서 실행됩니다
- ZeroMQ 수신기가 `tcp://localhost:5555`에서 데이터를 수신합니다
- 비디오 스트림을 보려면 ZeroMQ 송신기가 먼저 실행되어야 합니다
- 애플리케이션을 중지하려면 `Ctrl+C`를 누르세요

## 프로젝트 구조

```
fruit_dashbord/
├── app.py                 # 메인 Flask 애플리케이션
├── zeromq_receiver.py    # ZeroMQ 수신기 모듈
├── templates/
│   └── dashboard.html    # 대시보드 HTML 템플릿
├── static/
│   ├── css/
│   │   └── style.css    # 스타일시트
│   └── js/
│       └── script.js    # JavaScript 파일
└── README.md            # 이 파일
```

## 문제 해결

### 포트가 이미 사용 중인 경우
다른 프로그램이 포트 5001을 사용 중이면 app.py의 마지막 줄을 수정하세요:
```python
app.run(host='0.0.0.0', port=5002, debug=False, threaded=True)
```

### ZeroMQ 연결 오류
ZeroMQ 송신기가 `tcp://localhost:5555`에서 실행 중인지 확인하세요.

