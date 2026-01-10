const audio = document.getElementById('mainAudio');
const playlistDiv = document.getElementById('customPlaylist');
const statusLabel = document.getElementById('status');
const playBtn = document.getElementById('playBtn');
const loopBtn = document.getElementById('loopBtn');

let playlist = [];
let selectedUrl = "";
let isLooping = false;

// CẤU HÌNH GITHUB
const YOUR_GITHUB_USER = 'phucnguyen987'; 
const YOUR_REPO_NAME = 'Phonk-web';

// --- HÀM RÚT GỌN TÊN NHẠC ---
function truncateName(name, limit = 25) {
    let cleanName = name.replace('.mp3', ''); // Xóa đuôi file
    if (cleanName.length > limit) {
        return cleanName.substring(0, limit) + "...";
    }
    return cleanName;
}

async function autoLoadFromGitHub() {
    statusLabel.innerText = "ĐANG LOAD NHẠC...";
    try {
        const repoUrl = `https://api.github.com/repos/${YOUR_GITHUB_USER}/${YOUR_REPO_NAME}/contents/music`;
        
        const response = await fetch(repoUrl);
        if (!response.ok) throw new Error("Lỗi kết nối GitHub API");
        
        const data = await response.json();
        
        playlist = data
            .filter(file => file.name.toLowerCase().endsWith('.mp3'))
            .map(file => ({
                fullName: file.name, // Lưu tên đầy đủ để hiển thị khi phát
                download_url: file.download_url
            }));
            
        if (playlist.length === 0) {
            statusLabel.innerText = "❌ Thư mục /music trống!";
            return;
        }

        renderPlaylist(playlist);
        statusLabel.innerText = `✅ ĐÃ LOAD XONG: ${playlist.length} bài!`;
    } catch (err) {
        statusLabel.innerHTML = `<span style="color: #ff4444;">❌ Lỗi: Kiểm tra lại tên User hoặc Repo!</span>`;
        console.error(err);
    }
}

function renderPlaylist(list) {
    playlistDiv.innerHTML = "";
    list.forEach((file, index) => {
        const div = document.createElement('div');
        div.className = 'song-item';
        div.setAttribute('tabindex', '0'); 
        
        // Rút gọn tên bài hát hiển thị trong danh sách (giới hạn 25 ký tự)
        const shortName = truncateName(file.fullName, 25);
        div.innerText = `${index + 1}. ${shortName}`;
        
        // Truyền file.fullName vào hàm selectSong để hiện tên đầy đủ khi phát
        div.onclick = () => selectSong(div, file.download_url, file.fullName);
        
        div.onkeydown = (e) => {
            if (e.key === "Enter") selectSong(div, file.download_url, file.fullName);
        };

        playlistDiv.appendChild(div);
    });
}

function selectSong(element, url, fullName) {
    document.querySelectorAll('.song-item').forEach(i => i.classList.remove('active'));
    element.classList.add('active');
    
    selectedUrl = url;
    audio.src = url;
    audio.play().catch(e => console.log("Auto-play bị chặn"));
    
    playBtn.innerText = "TẠM DỪNG";
    
    // Khi đang phát, hiển thị tên đầy đủ để người dùng biết bài gì
    statusLabel.innerText = "🔥 ĐANG PHÁT: " + fullName.replace('.mp3', '');
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

function startApp() {
    autoLoadFromGitHub();
}

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
                };
