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


    // Initial chart render
    renderChart();
    window.addEventListener('resize', () => { myChart.resize(); });
});
