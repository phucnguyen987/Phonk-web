const audio = document.getElementById('mainAudio');
const playlistDiv = document.getElementById('customPlaylist');
const status = document.getElementById('status');
const playBtn = document.getElementById('playBtn');
const loopBtn = document.getElementById('loopBtn');

let playlist = [];
let selectedUrl = "";
let isLooping = false;

// Tự động nạp nhạc từ playlist.txt
async function autoLoadFromText() {
    try {
        const response = await fetch('playlist.txt?t=' + new Date().getTime());
        const text = await response.text();
        playlist = text.split('\n').filter(name => name.trim().endsWith('.mp3'));
        renderPlaylist(playlist);
    } catch (err) {
        status.innerText = "❌ Lỗi: Chưa chạy lệnh tạo playlist.txt";
    }
}

// Hiển thị danh sách nhạc ra màn hình
function renderPlaylist(list) {
    playlistDiv.innerHTML = "";
    list.forEach((name, index) => {
        const div = document.createElement('div');
        div.className = 'song-item';
        div.innerText = `${index + 1}. ${name.trim().replace('.mp3', '')}`;
        div.onclick = () => selectSong(div, `music/${name.trim()}`);
        playlistDiv.appendChild(div);
    });
}

// Khi người dùng nhấn chọn một bài
function selectSong(element, url) {
    document.querySelectorAll('.song-item').forEach(i => i.classList.remove('active'));
    element.classList.add('active');
    selectedUrl = url;
    
    // Tự động phát khi chọn bài
    audio.src = url;
    audio.play();
    playBtn.innerText = "TẠM DỪNG";
    status.innerText = "🔥 Đang phát: " + element.innerText;
}

// Điều khiển Phát/Dừng
function handlePlay() {
    if (!selectedUrl) return alert("Hãy chọn một bài nhạc trước!");
    
    if (audio.paused) {
        audio.play();
        playBtn.innerText = "TẠM DỪNG";
        status.innerText = "🔥 Tiếp tục quẩy...";
    } else {
        audio.pause();
        playBtn.innerText = "PHÁT NHẠC";
        status.innerText = "⏸️ Đã tạm dừng.";
    }
}

// Bật/Tắt lặp lại
function handleLoop() {
    isLooping = !isLooping;
    audio.loop = isLooping;
    loopBtn.innerText = isLooping ? "LẶP: BẬT" : "LẶP: TẮT";
    loopBtn.style.background = isLooping ? "#ff0000" : "transparent";
    loopBtn.style.color = isLooping ? "#000" : "#ff0000";
}

// Tìm kiếm bài hát
function filterSongs() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const items = document.querySelectorAll('.song-item');
    items.forEach(item => {
        item.style.display = item.innerText.toLowerCase().includes(term) ? "" : "none";
    });
}

// Khi nhấn "VÀO HỆ THỐNG"
function startApp() {
    document.getElementById('intro-page').style.display = 'none';
    autoLoadFromText();
    // Khởi tạo audio context để fix lỗi loa trên mobile
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

// Tự động chuyển bài khi hết
audio.onended = function() {
    if (!isLooping) {
        // Tìm bài tiếp theo trong danh sách
        let items = document.querySelectorAll('.song-item');
        let currentIndex = -1;
        items.forEach((item, index) => {
            if (item.classList.contains('active')) currentIndex = index;
        });
        
        let nextIndex = (currentIndex + 1) % items.length;
        items[nextIndex].click(); // Giả lập click vào bài tiếp theo
    }
};
