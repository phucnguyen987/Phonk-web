const audio = document.getElementById('mainAudio');
const playlistDiv = document.getElementById('customPlaylist');
const statusLabel = document.getElementById('status');
const playBtn = document.getElementById('playBtn');
const loopBtn = document.getElementById('loopBtn');

let playlist = [];
let selectedUrl = "";
let isLooping = false;

const YOUR_GITHUB_USER = 'phucnguyen987'; 
const YOUR_REPO_NAME = 'Phonk-web';

// --- HÀM LỌC TÊN THẬT (XÓA RÁC QUẢNG CÁO) ---
function getCleanName(name) {
    let n = name.replace('.mp3', ''); // Xóa đuôi file
    
    // 1. Xóa các trang web tải nhạc phổ biến
    const junkWords = [
        'y2meta.is', 'y2mate.com', 'vevioz.com', 'yt5s.com', 
        'snapsave.io', 'SaveTube.App', '9xbuddy', 'Download',
        '-', '_', '[', ']', '(', ')'
    ];
    
    junkWords.forEach(word => {
        // Xóa từ và các khoảng trắng dư thừa
        n = n.split(word).join(' ');
    });

    // 2. Xóa các chuỗi mã ID video thường dính ở cuối (ví dụ: gWpI0fL...)
    n = n.replace(/[a-zA-Z0-9_-]{11}$/, "");

    // 3. Rút gọn tên nếu quá dài (giới hạn 25 ký tự cho danh sách)
    n = n.trim();
    if (n.length > 25) {
        n = n.substring(0, 25) + "...";
    }
    
    return n || "Bài hát không tên";
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
                fullName: file.name,
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
    }
}

function renderPlaylist(list) {
    playlistDiv.innerHTML = "";
    list.forEach((file, index) => {
        const div = document.createElement('div');
        div.className = 'song-item';
        div.setAttribute('tabindex', '0'); 
        
        // SỬ DỤNG HÀM LỌC TÊN THẬT TẠI ĐÂY
        const cleanName = getCleanName(file.fullName);
        div.innerText = `${index + 1}. ${cleanName}`;
        
        div.onclick = () => selectSong(div, file.download_url, file.fullName);
        div.onkeydown = (e) => { if (e.key === "Enter") selectSong(div, file.download_url, file.fullName); };

        playlistDiv.appendChild(div);
    });
}

function selectSong(element, url, fullName) {
    document.querySelectorAll('.song-item').forEach(i => i.classList.remove('active'));
    element.classList.add('active');
    selectedUrl = url;
    audio.src = url;
    audio.play().catch(e => console.log("Auto-play blocked"));
    playBtn.innerText = "TẠM DỪNG";
    
    // Khi phát vẫn hiện tên đã lọc sạch
    statusLabel.innerText = "🔥 ĐANG PHÁT: " + getCleanName(fullName);
}

function handlePlay() {
    if (!selectedUrl) return;
    if (audio.paused) { audio.play(); playBtn.innerText = "TẠM DỪNG"; } 
    else { audio.pause(); playBtn.innerText = "PHÁT NHẠC"; }
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

function startApp() { autoLoadFromGitHub(); }

audio.onended = function() {
    if (!isLooping) {
        let items = Array.from(document.querySelectorAll('.song-item'));
        let currentIndex = items.findIndex(item => item.classList.contains('active'));
        if (currentIndex !== -1 && currentIndex < items.length - 1) {
            items[currentIndex + 1].click();
            items[currentIndex + 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
};
