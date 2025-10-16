document.addEventListener('DOMContentLoaded', function () {
    // Live Timestamp
    const timestampEl = document.getElementById('live-timestamp');
    function updateTimestamp() {
        const now = new Date();
        const year = String(now.getFullYear()).slice(-2);
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        timestampEl.textContent = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    setInterval(updateTimestamp, 1000);
    updateTimestamp();

    // Task Toggle Button
    const taskToggle = document.getElementById('task-toggle');
    taskToggle.addEventListener('click', () => {
        const isRunning = taskToggle.classList.toggle('danger');
        if (isRunning) {
            taskToggle.innerHTML = '<i class="fa-solid fa-stop"></i> 스톱';
        } else {
            taskToggle.innerHTML = '<i class="fa-solid fa-play"></i> 업무 시작';
            taskToggle.classList.remove('danger');
            taskToggle.classList.add('primary');
        }
    });

    // Record Toggle Button
    const recordToggle = document.getElementById('record-toggle');
    recordToggle.addEventListener('click', () => {
        const isRecording = recordToggle.classList.toggle('danger');
        if (isRecording) {
            recordToggle.innerHTML = '<i class="fa-solid fa-circle-stop"></i> 정지';
        } else {
            recordToggle.innerHTML = '<i class="fa-solid fa-video"></i> 녹화';
        }
    });
    
    // Bounding Box Toggle
    const bboxToggle = document.getElementById('bbox-toggle');
    
    // 초기 인식박스 상태를 파라미터 서버에서 가져오기
    async function initializeBboxToggle() {
        try {
            const response = await fetch(CONFIG.parameterServerUrl + CONFIG.endpoints.parameterGet + '?param_name=use_yolo');
            const data = await response.json();
            console.log('resp: ', data);

            const success = data.success;
            const useYolo = data.param_value;

            // useYolo 값에 따라 버튼 상태 설정 (useYolo active 상태가 반대)
            if (useYolo) {
                bboxToggle.classList.add('active');
                bboxToggle.textContent = '인식박스';
            } else {
                bboxToggle.classList.remove('active');
                bboxToggle.textContent = '인식박스 X';
            }
            
        } catch (error) {
            console.error('YOLO 초기 상태 가져오기 오류:', error);
            // 오류 시 기본 상태 유지
        }
    }
    
    // 초기화 실행
    initializeBboxToggle();
    
    bboxToggle.addEventListener('click', async () => {
        const isActive = bboxToggle.classList.toggle('active');
        bboxToggle.textContent = isActive ? '인식박스' : '인식박스 X';
        
        // 파라미터 서버의 YOLO 토글 API 호출
        try {
            const response = await fetch(CONFIG.parameterServerUrl + CONFIG.endpoints.yoloToggle, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ use_yolo: isActive })
            });
            const data = await response.json();
            console.log('resp: ', data);
            
        } catch (error) {
            console.error('YOLO 토글 API 호출 오류:', error);
        }
    });
    
    // Camera Toggle
    const cameraToggle = document.getElementById('camera-toggle');
    const videoFeed = document.querySelector('.vision-screen img');
    const videoFeedUrl = '/video_feed';
    
    cameraToggle.addEventListener('click', () => {
        const isActive = cameraToggle.classList.toggle('active');
        
        if (isActive) {
            // 카메라 켜기: 비디오 피드 활성화
            videoFeed.src = videoFeedUrl;
            videoFeed.style.opacity = '1';
        } else {
            // 카메라 끄기: 비디오 피드 중지
            videoFeed.src = '';
            videoFeed.style.opacity = '0.3';
        }
    });

    // Price Edit/Save Toggle
    const priceEditToggle = document.getElementById('price-edit-toggle');
    const priceInputs = document.querySelectorAll('.price-list input');
    priceEditToggle.addEventListener('click', () => {
        const isEditing = priceEditToggle.textContent === '수정';
        if (isEditing) {
            priceEditToggle.textContent = '저장';
            priceEditToggle.classList.remove('primary');
            priceInputs.forEach(input => {
                input.classList.add('editing');
                input.readOnly = false;
            });
        } else {
            priceEditToggle.textContent = '수정';
            priceEditToggle.classList.add('primary');
            priceInputs.forEach(input => {
                input.classList.remove('editing');
                input.readOnly = true;
            });
        }
    });
    
    // ECharts Implementation
    const chartDom = document.getElementById('echarts-container');
    const myChart = echarts.init(chartDom);
    let currentTimeFilter = 'Daily';
    let currentFruitFilter = 'Total';
    let currentChartType = 'line';

    const chartData = {
        Daily: {
            Total: {
                categories: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
                orders: [10, 15, 22, 18, 25, 30, 20, 35],
                income: [5, 8, 11, 9, 13, 15, 10, 18]
            }
        }
        // Add more data for Weekly, Monthly, and other fruits if needed
    };

    function renderChart() {
        const data = chartData[currentTimeFilter][currentFruitFilter];
        if (!data) return;

        const option = {
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['Orders', 'Income'],
                textStyle: { color: '#fff' }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: currentChartType === 'bar',
                data: data.categories,
                axisLine: { lineStyle: { color: 'rgba(255,255,255,0.5)' } }
            },
            yAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: 'rgba(255,255,255,0.5)' } },
                splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
            },
            series: [
                {
                    name: 'Orders',
                    type: currentChartType,
                    smooth: true,
                    data: data.orders,
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#34a9a0' },
                            { offset: 1, color: '#204825' }
                        ])
                    },
                    areaStyle: {
                        opacity: 0.8,
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(52, 169, 160, 0.5)' },
                            { offset: 1, color: 'rgba(32, 72, 37, 0.1)' }
                        ])
                    }
                },
                {
                    name: 'Income',
                    type: currentChartType,
                    smooth: true,
                    data: data.income,
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#cfeb44' },
                            { offset: 1, color: '#34a9a0' }
                        ])
                    },
                    areaStyle: {
                        opacity: 0.8,
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(207, 235, 68, 0.5)' },
                            { offset: 1, color: 'rgba(52, 169, 160, 0.1)' }
                        ])
                    }
                }
            ]
        };
        myChart.setOption(option, true);
    }
    
    // Filter button event listeners
    document.getElementById('time-filter').addEventListener('click', (e) => {
        if(e.target.tagName === 'BUTTON') {
            currentTimeFilter = e.target.dataset.value;
            renderChart();
        }
    });
    document.getElementById('fruit-filter').addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if(button) {
            currentFruitFilter = button.dataset.value;
            renderChart();
        }
    });
    document.getElementById('chart-type-filter').addEventListener('click', (e) => {
        if(e.target.tagName === 'BUTTON') {
            currentChartType = e.target.dataset.value;
            renderChart();
        }
    });

    // Generic filter group active state handler
    const filterGroups = document.querySelectorAll('.filter-group');
    filterGroups.forEach(group => {
        group.addEventListener('click', (e) => {
            const clickedButton = e.target.closest('button');
            if (!clickedButton) return;
            
            const buttons = group.querySelectorAll('.btn');
            buttons.forEach(btn => btn.classList.remove('active'));
            clickedButton.classList.add('active');
        });
    });

    // Robot Control - I Button (Forward)
    const btnI = document.getElementById('btn-i');
    
    if (btnI) {
        btnI.addEventListener('click', async () => {
            try {
                const response = await fetch(CONFIG.controlServerUrl + CONFIG.endpoints.robotForward, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ speed: CONFIG.robotControl.defaultSpeed })
                });
                const data = await response.json();
                console.log('Robot forward response:', data);
                
                if (data.success) {
                    // 성공 시 버튼 피드백 (선택적)
                    btnI.style.backgroundColor = '#34a9a0';
                    setTimeout(() => {
                        btnI.style.backgroundColor = '';
                    }, 200);
                }
            } catch (error) {
                console.error('Robot forward API 호출 오류:', error);
            }
        });
    }

    // Robot Control - J Button (Backward)
    const btnJ = document.getElementById('btn-j');
    
    if (btnJ) {
        btnJ.addEventListener('click', async () => {
            try {
                const response = await fetch(CONFIG.controlServerUrl + CONFIG.endpoints.robotBackward, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ speed: CONFIG.robotControl.defaultSpeed })
                });
                const data = await response.json();
                console.log('Robot backward response:', data);
                
                if (data.success) {
                    // 성공 시 버튼 피드백 (선택적)
                    btnJ.style.backgroundColor = '#34a9a0';
                    setTimeout(() => {
                        btnJ.style.backgroundColor = '';
                    }, 200);
                }
            } catch (error) {
                console.error('Robot backward API 호출 오류:', error);
            }
        });
    }

    // Robot Control - K Button (Turn Left)
    const btnK = document.getElementById('btn-k');
    
    if (btnK) {
        btnK.addEventListener('click', async () => {
            try {
                const response = await fetch(CONFIG.controlServerUrl + CONFIG.endpoints.robotTurnLeft, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ speed: CONFIG.robotControl.defaultSpeed })
                });
                const data = await response.json();
                console.log('Robot turn_left response:', data);
                
                if (data.success) {
                    // 성공 시 버튼 피드백 (선택적)
                    btnK.style.backgroundColor = '#34a9a0';
                    setTimeout(() => {
                        btnK.style.backgroundColor = '';
                    }, 200);
                }
            } catch (error) {
                console.error('Robot turn_left API 호출 오류:', error);
            }
        });
    }

    // Robot Control - L Button (Turn Right)
    const btnL = document.getElementById('btn-l');
    
    if (btnL) {
        btnL.addEventListener('click', async () => {
            try {
                const response = await fetch(CONFIG.controlServerUrl + CONFIG.endpoints.robotTurnRight, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ speed: CONFIG.robotControl.defaultSpeed })
                });
                const data = await response.json();
                console.log('Robot turn_right response:', data);
                
                if (data.success) {
                    // 성공 시 버튼 피드백 (선택적)
                    btnL.style.backgroundColor = '#34a9a0';
                    setTimeout(() => {
                        btnL.style.backgroundColor = '';
                    }, 200);
                }
            } catch (error) {
                console.error('Robot turn_right API 호출 오류:', error);
            }
        });
    }

    // Robot Control - O Button (Gripper Open)
    const btnO = document.getElementById('btn-o');
    
    if (btnO) {
        btnO.addEventListener('click', async () => {
            try {
                const response = await fetch(CONFIG.controlServerUrl + CONFIG.endpoints.gripperOpen, {
                    method: 'POST'
                });
                const data = await response.json();
                console.log('Gripper open response:', data);
                
                if (data.success) {
                    // 성공 시 버튼 피드백 (선택적)
                    btnO.style.backgroundColor = '#34a9a0';
                    setTimeout(() => {
                        btnO.style.backgroundColor = '';
                    }, 200);
                }
            } catch (error) {
                console.error('Gripper open API 호출 오류:', error);
            }
        });
    }

    // Robot Control - P Button (Gripper Close)
    const btnP = document.getElementById('btn-p');
    
    if (btnP) {
        btnP.addEventListener('click', async () => {
            try {
                const response = await fetch(CONFIG.controlServerUrl + CONFIG.endpoints.gripperClose, {
                    method: 'POST'
                });
                const data = await response.json();
                console.log('Gripper close response:', data);
                
                if (data.success) {
                    // 성공 시 버튼 피드백 (선택적)
                    btnP.style.backgroundColor = '#34a9a0';
                    setTimeout(() => {
                        btnP.style.backgroundColor = '';
                    }, 200);
                }
            } catch (error) {
                console.error('Gripper close API 호출 오류:', error);
            }
        });
    }

    // Robot Control - Button 1 (Arm Joint 0 +)
    const btn1 = document.getElementById('btn-1');
    
    if (btn1) {
        btn1.addEventListener('click', async () => {
            try {
                const response = await fetch(CONFIG.controlServerUrl + CONFIG.endpoints.armJoint + '0', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ delta: '+' })
                });
                const data = await response.json();
                console.log('Arm joint 0 response:', data);
                
                if (data.success) {
                    // 성공 시 버튼 피드백 (선택적)
                    btn1.style.backgroundColor = '#34a9a0';
                    setTimeout(() => {
                        btn1.style.backgroundColor = '';
                    }, 200);
                }
            } catch (error) {
                console.error('Arm joint 0 API 호출 오류:', error);
            }
        });
    }

    // Robot Control - Button Q (Arm Joint 0 -)
    const btnQ = document.getElementById('btn-q');
    
    if (btnQ) {
        btnQ.addEventListener('click', async () => {
            try {
                const response = await fetch(CONFIG.controlServerUrl + CONFIG.endpoints.armJoint + '0', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ delta: '-' })
                });
                const data = await response.json();
                console.log('Arm joint 0 response:', data);
                
                if (data.success) {
                    // 성공 시 버튼 피드백 (선택적)
                    btnQ.style.backgroundColor = '#34a9a0';
                    setTimeout(() => {
                        btnQ.style.backgroundColor = '';
                    }, 200);
                }
            } catch (error) {
                console.error('Arm joint 0 API 호출 오류:', error);
            }
        });
    }

    // Robot Control - Button 2 (Arm Joint 1 +)
    const btn2 = document.getElementById('btn-2');
    
    if (btn2) {
        btn2.addEventListener('click', async () => {
            try {
                const response = await fetch(CONFIG.controlServerUrl + CONFIG.endpoints.armJoint + '1', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ delta: '+' })
                });
                const data = await response.json();
                console.log('Arm joint 1 response:', data);
                
                if (data.success) {
                    // 성공 시 버튼 피드백 (선택적)
                    btn2.style.backgroundColor = '#34a9a0';
                    setTimeout(() => {
                        btn2.style.backgroundColor = '';
                    }, 200);
                }
            } catch (error) {
                console.error('Arm joint 1 API 호출 오류:', error);
            }
        });
    }

    // Robot Control - Button W (Arm Joint 1 -)
    const btnW = document.getElementById('btn-w');
    
    if (btnW) {
        btnW.addEventListener('click', async () => {
            try {
                const response = await fetch(CONFIG.controlServerUrl + CONFIG.endpoints.armJoint + '1', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ delta: '-' })
                });
                const data = await response.json();
                console.log('Arm joint 1 response:', data);
                
                if (data.success) {
                    // 성공 시 버튼 피드백 (선택적)
                    btnW.style.backgroundColor = '#34a9a0';
                    setTimeout(() => {
                        btnW.style.backgroundColor = '';
                    }, 200);
                }
            } catch (error) {
                console.error('Arm joint 1 API 호출 오류:', error);
            }
        });
    }

    // Robot Control - Button 3 (Arm Joint 2 +)
    const btn3 = document.getElementById('btn-3');
    
    if (btn3) {
        btn3.addEventListener('click', async () => {
            try {
                const response = await fetch(CONFIG.controlServerUrl + CONFIG.endpoints.armJoint + '2', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ delta: '+' })
                });
                const data = await response.json();
                console.log('Arm joint 2 response:', data);
                
                if (data.success) {
                    // 성공 시 버튼 피드백 (선택적)
                    btn3.style.backgroundColor = '#34a9a0';
                    setTimeout(() => {
                        btn3.style.backgroundColor = '';
                    }, 200);
                }
            } catch (error) {
                console.error('Arm joint 2 API 호출 오류:', error);
            }
        });
    }

    // Robot Control - Button E (Arm Joint 2 -)
    const btnE = document.getElementById('btn-e');
    
    if (btnE) {
        btnE.addEventListener('click', async () => {
            try {
                const response = await fetch(CONFIG.controlServerUrl + CONFIG.endpoints.armJoint + '2', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ delta: '-' })
                });
                const data = await response.json();
                console.log('Arm joint 2 response:', data);
                
                if (data.success) {
                    // 성공 시 버튼 피드백 (선택적)
                    btnE.style.backgroundColor = '#34a9a0';
                    setTimeout(() => {
                        btnE.style.backgroundColor = '';
                    }, 200);
                }
            } catch (error) {
                console.error('Arm joint 2 API 호출 오류:', error);
            }
        });
    }

    // Robot Control - Button 4 (Arm Joint 3 +)
    const btn4 = document.getElementById('btn-4');
    
    if (btn4) {
        btn4.addEventListener('click', async () => {
            try {
                const response = await fetch(CONFIG.controlServerUrl + CONFIG.endpoints.armJoint + '3', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ delta: '+' })
                });
                const data = await response.json();
                console.log('Arm joint 3 response:', data);
                
                if (data.success) {
                    // 성공 시 버튼 피드백 (선택적)
                    btn4.style.backgroundColor = '#34a9a0';
                    setTimeout(() => {
                        btn4.style.backgroundColor = '';
                    }, 200);
                }
            } catch (error) {
                console.error('Arm joint 3 API 호출 오류:', error);
            }
        });
    }

    // Robot Control - Button R (Arm Joint 3 -)
    const btnR = document.getElementById('btn-r');
    
    if (btnR) {
        btnR.addEventListener('click', async () => {
            try {
                const response = await fetch(CONFIG.controlServerUrl + CONFIG.endpoints.armJoint + '3', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ delta: '-' })
                });
                const data = await response.json();
                console.log('Arm joint 3 response:', data);
                
                if (data.success) {
                    // 성공 시 버튼 피드백 (선택적)
                    btnR.style.backgroundColor = '#34a9a0';
                    setTimeout(() => {
                        btnR.style.backgroundColor = '';
                    }, 200);
                }
            } catch (error) {
                console.error('Arm joint 3 API 호출 오류:', error);
            }
        });
    }

    // Robot Control - Home Button (Position Reset)
    const btnHome = document.getElementById('btn-home');
    
    if (btnHome) {
        btnHome.addEventListener('click', async () => {
            try {
                const response = await fetch(CONFIG.controlServerUrl + CONFIG.endpoints.robotHome, {
                    method: 'POST'
                });
                const data = await response.json();
                console.log('Robot home response:', data);
                
                if (data.success) {
                    // 성공 시 버튼 피드백 (선택적)
                    btnHome.style.backgroundColor = '#34a9a0';
                    setTimeout(() => {
                        btnHome.style.backgroundColor = '';
                    }, 200);
                }
            } catch (error) {
                console.error('Robot home API 호출 오류:', error);
            }
        });
    }

    // Robot Control - Spawn Fruit Button
    const btnSpawnFruit = document.getElementById('btn-spawn-fruit');
    
    if (btnSpawnFruit) {
        btnSpawnFruit.addEventListener('click', async () => {
            try {
                const response = await fetch(CONFIG.controlServerUrl + CONFIG.endpoints.fruitSpawnAll, {
                    method: 'POST'
                });
                const data = await response.json();
                console.log('Fruit spawn response:', data);
                
                if (data.success) {
                    // 성공 시 버튼 피드백 (선택적)
                    btnSpawnFruit.style.backgroundColor = '#34a9a0';
                    setTimeout(() => {
                        btnSpawnFruit.style.backgroundColor = '';
                    }, 200);
                }
            } catch (error) {
                console.error('Fruit spawn API 호출 오류:', error);
            }
        });
    }

    // Initial chart render
    renderChart();
    window.addEventListener('resize', () => { myChart.resize(); });
});
