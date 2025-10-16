// 서버 설정 정보
const CONFIG = {
    // 파라미터 서버 URL
    parameterServerUrl: 'http://localhost:5002',
    // 로봇 제어 서버 URL
    controlServerUrl: 'http://localhost:5003',

    // 대시보드 서버 URL (현재 서버)
    dashboardServerUrl: 'http://localhost:5001',
    
    // API 엔드포인트
    endpoints: {
        // 파라미터 서버 API
        yoloToggle: '/api/yolo/toggle',
        parameterGet: '/api/parameter/get',
        status: '/api/status',
        streamStats: '/api/stream_stats',
        videoFeed: '/video_feed',
        
        // 로봇 제어 API
        robotForward: '/api/robot/forward',
        robotBackward: '/api/robot/backward',
        robotTurnLeft: '/api/robot/turn_left',
        robotTurnRight: '/api/robot/turn_right',
        robotHome: '/api/robot/home',
        
        // 그리퍼 제어 API
        gripperOpen: '/api/gripper/open',
        gripperClose: '/api/gripper/close',
        
        // 팔 관절 제어 API
        armJoint: '/api/arm/joint/',  // joint number를 뒤에 추가
        
        // 과일 생성 API
        fruitSpawnAll: '/api/fruit/spawn/all'
    },
    
    // 로봇 제어 설정
    robotControl: {
        defaultSpeed: 0.5
    },
    
    // 타임아웃 설정 (밀리초)
    timeout: 5000,
    
    // 새로고침 간격 (밀리초)
    refreshInterval: {
        timestamp: 1000,  // 1초
        stats: 5000       // 5초
    }
};

// 전역으로 사용 가능하도록 export (또는 window 객체에 추가)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

