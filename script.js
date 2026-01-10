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

// --- HÀM LỌC TÊN THẬT (FIX LỖI MẤT BÀI) ---
function getCleanName(name) {
    if (!name) return "Bài hát không tên";
    
    // 1. Xóa đuôi file .mp3 (không phân biệt hoa thường)
    let n = name.replace(/\.mp3/i, ''); 
    
    // 2. Danh sách các từ cần xóa sạch (Quảng cáo web)
    const junkWords = [
        'y2meta.is', 'y2mate.com', 'vevioz.com', 'yt5s.com', 
        'snapsave.io', 'SaveTube.App', '9xbuddy', 'Download'
    ];
    
    junkWords.forEach(word => {
        let reg = new RegExp(word, "gi");
        n = n.replace(reg, "");
    });

    // 3. Thay thế các ký tự đặc biệt thành khoảng trắng
    n = n.replace(/[_\-\[\]\(\)]/g, ' ');

    // 4. Xóa các khoảng trắng dư thừa
    n = n.replace(/\s+/g, ' ').trim();

    // 5. Rút gọn tên nếu quá dài để không tràn dòng (Giới hạn 30 ký tự)
    if (n.length > 30) {
        n = n.substring(0, 30) + "...";
    }
    
    // Nếu sau khi lọc mà chuỗi trống, trả về tên gốc (để không bị mất bài)
    return n || name.replace(/\.mp3/i, '');
}

async function autoLoadFromGitHub() {
    statusLabel.innerText = "ĐANG LOAD NHẠC...";
    try {
        const repoUrl = `https://api.github.com/repos/${YOUR_GITHUB_USER}/${YOUR_REPO_NAME}/contents/music`;
        const response = await fetch(repoUrl);
        
        if (!response.ok) throw new Error("Lỗi kết nối GitHub");
        
        const data = await response.json();
        
        // Lấy danh sách file mp3
        playlist = data
            .filter(file => file.name.toLowerCase().endsWith('.mp3'))
            .map(file => ({
                fullName: file.name,
                download_url: file.download_url
            }));
            
        if (playlist.length === 0) {
            statusLabel.innerText = "❌ Thư mục /music không có nhạc!";
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
    playlistDiv.innerHTML = ""; // Xóa danh sách cũ
    list.forEach((file, index) => {
        const div = document.createElement('div');
        div.className = 'song-item';
        div.setAttribute('tabindex', '0'); 
        
        // Lấy tên sạch để hiển thị
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
    audio.play().catch(e => console.log("Yêu cầu tương tác để phát nhạc"));
    
    playBtn.innerText = "TẠM DỪNG";
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
        
