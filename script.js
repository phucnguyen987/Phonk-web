const audio = document.getElementById('mainAudio');
const playlistDiv = document.getElementById('customPlaylist');
const statusLabel = document.getElementById('status');
const playBtn = document.getElementById('playBtn');
const loopBtn = document.getElementById('loopBtn');

let playlist = [];
let selectedUrl = "";
let isLooping = false;

// CẤU HÌNH CHÍNH XÁC - KHÔNG ĐỔI TÊN BIẾN Ở DƯỚI
const YOUR_GITHUB_USER = 'phucnguyen987'; 
const YOUR_REPO_NAME = 'Phonk-web';

async function autoLoadFromGitHub() {
    statusLabel.innerText = "ĐANG LOAD NHẠC...";
    try {
        // FIX: Đã sử dụng chính xác YOUR_GITHUB_USER và YOUR_REPO_NAME
        const repoUrl = `https://api.github.com/repos/${YOUR_GITHUB_USER}/${YOUR_REPO_NAME}/contents/music`;
        
        const response = await fetch(repoUrl);
        
        if (!response.ok) {
            throw new Error("Lỗi kết nối GitHub API");
        }
        
        const data = await response.json();
        
        // Lọc lấy các file nhạc .mp3
        playlist = data
            .filter(file => file.name.toLowerCase().endsWith('.mp3'))
            .map(file => ({
                name: file.name,
                download_url: file.download_url
            }));
            
        if (playlist.length === 0) {
            statusLabel.innerText = "❌ Thư mục /music trống hoặc không có file .mp3";
            return;
        }

        renderPlaylist(playlist);
        statusLabel.innerText = `✅ ĐÃ LOAD XONG: ${playlist.length} bài!`;
    } catch (err) {
        // Hiển thị lỗi đỏ như trong ảnh bạn gửi
        statusLabel.innerHTML = `<span style="color: #ff4444;">❌ Lỗi: Kiểm tra lại tên User hoặc Repo!</span>`;
        console.error("Chi tiết lỗi:", err);
    }
}

function renderPlaylist(list) {
    playlistDiv.innerHTML = "";
    list.forEach((file, index) => {
        const div = document.createElement('div');
        div.className = 'song-item';
        div.setAttribute('tabindex', '0'); // Hỗ trợ Remote TV
        div.innerText = `${index + 1}. ${file.name.replace('.mp3', '')}`;
        
        div.onclick = () => selectSong(div, file.download_url);
        
        // Hỗ trợ nút OK trên Remote TV
        div.onkeydown = (e) => {
            if (e.key === "Enter") selectSong(div, file.download_url);
        };

        playlistDiv.appendChild(div);
    });
}

function selectSong(element, url) {
    document.querySelectorAll('.song-item').forEach(i => i.classList.remove('active'));
    element.classList.add('active');
    
    selectedUrl = url;
    audio.src = url;
    audio.play().catch(e => console.log("Auto-play bị chặn bởi trình duyệt"));
    
    playBtn.innerText = "TẠM DỪNG";
    statusLabel.innerText = "🔥 ĐANG PHÁT: " + element.innerText.split('. ')[1];
}

function handlePlay() {
    if (!selectedUrl) {
        alert("Chọn nhạc đã bro!");
        return;
    }
    if (audio.paused) {
        audio.play();
        playBtn.innerText = "TẠM DỪNG";
    } else {
        audio.pause();
        playBtn.innerText = "PHÁT NHẠC";
    }
}

function handleLoop() {
    isLooping = !isLooping;
    audio.loop = isLooping;
    loopBtn.innerText = isLooping ? "LẶP: BẬT" : "LẶP: TẮT";
    loopBtn.style.color = isLooping ? "#00ff00" : "#fff";
}

function filterSongs() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const items = document.querySelectorAll('.song-item');
    items.forEach(item => {
        item.style.display = item.innerText.toLowerCase().includes(term) ? "" : "none";
    });
}

// Gọi từ nút "VÀO HỆ THỐNG"
function startApp() {
    autoLoadFromGitHub();
}

// Tự động chuyển bài
audio.onended = function() {
    if (!isLooping) {
        let items = Array.from(document.querySelectorAll('.song-item'));
        let currentIndex = items.findIndex(item => item.classList.contains('active'));
        
        if (currentIndex !== -1 && currentIndex < items.length - 1) {
            let nextIndex = currentIndex + 1;
            items[nextIndex].click();
            items[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
};
