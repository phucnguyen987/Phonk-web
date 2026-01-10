const audio = document.getElementById('mainAudio');
const playlistDiv = document.getElementById('customPlaylist');
const statusLabel = document.getElementById('status'); // Đã đổi tên để tránh trùng với biến hệ thống
const playBtn = document.getElementById('playBtn');
const loopBtn = document.getElementById('loopBtn');

let playlist = [];
let selectedUrl = "";
let isLooping = false;

// CẤU HÌNH GITHUB CHÍNH XÁC
const YOUR_GITHUB_USER = 'phucnguyen987'; 
const YOUR_REPO_NAME = 'Phonk-web';

async function autoLoadFromGitHub() {
    statusLabel.innerText = "ĐANG LOAD NHẠC...";
    try {
        // FIX LỖI: Thay YOUR_NAME bằng YOUR_GITHUB_USER cho đúng với khai báo ở trên
        const repoUrl = `https://api.github.com/repos/${YOUR_GITHUB_USER}/${YOUR_REPO_NAME}/contents/music`;
        
        const response = await fetch(repoUrl);
        
        if (!response.ok) {
            throw new Error("Không thể kết nối đến GitHub API");
        }
        
        const data = await response.json();
        
        // Lọc các file nhạc .mp3
        playlist = data
            .filter(file => file.name.toLowerCase().endsWith('.mp3'))
            .map(file => ({
                name: file.name,
                download_url: file.download_url
            }));
            
        if (playlist.length === 0) {
            statusLabel.innerText = "❌ Không tìm thấy file .mp3 nào trong thư mục music!";
            return;
        }

        renderPlaylist(playlist);
        statusLabel.innerText = `✅ ĐÃ LOAD XONG: ${playlist.length} bài!`;
    } catch (err) {
        // Hiện lỗi cụ thể ra màn hình như trong ảnh của bạn
        statusLabel.innerHTML = `<span style="color: red;">❌ Lỗi: Kiểm tra lại tên User hoặc Repo!</span>`;
        console.error("Chi tiết lỗi:", err);
    }
}

function renderPlaylist(list) {
    playlistDiv.innerHTML = "";
    list.forEach((file, index) => {
        const div = document.createElement('div');
        div.className = 'song-item';
        // Thêm thuộc tính tabindex để hỗ trợ Remote TV Samsung có thể Focus
        div.setAttribute('tabindex', '0'); 
        div.innerText = `${index + 1}. ${file.name.replace('.mp3', '')}`;
        
        div.onclick = () => selectSong(div, file.download_url);
        
        // Hỗ trợ ấn nút OK/Enter trên Remote TV
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
    audio.play().catch(e => console.log("Trình duyệt chặn tự động phát:", e));
    
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

// Hàm này được gọi từ nút "VÀO HỆ THỐNG" ở file HTML
function startApp() {
    // Ẩn trang intro đã được xử lý ở file HTML (startAppFixed)
    // Ở đây chỉ tập trung vào việc load dữ liệu
    autoLoadFromGitHub();
}

// Tự động chuyển bài khi hết nhạc
audio.onended = function() {
    if (!isLooping) {
        let items = Array.from(document.querySelectorAll('.song-item'));
        let currentIndex = items.findIndex(item => item.classList.contains('active'));
        
        if (currentIndex !== -1 && currentIndex < items.length - 1) {
            let nextIndex = currentIndex + 1;
            items[nextIndex].click();
            // Tự động cuộn tới bài đang phát nếu danh sách dài
            items[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
};
    
