const audio = document.getElementById('mainAudio');
const playlistDiv = document.getElementById('customPlaylist');
const status = document.getElementById('status');
const playBtn = document.getElementById('playBtn');
const loopBtn = document.getElementById('loopBtn');

let playlist = [];
let selectedUrl = "";
let isLooping = false;

// THAY THÔNG TIN CỦA BẠN VÀO ĐÂY
const YOUR_GITHUB_USER = 'TEN_USER_CUA_BAN'; 
const YOUR_REPO_NAME = 'TEN_REPO_CUA_BAN';

async function autoLoadFromGitHub() {
    status.innerText = "📡 Đang lấy nhạc từ GitHub...";
    try {
        const repoUrl = `https://api.github.com/repos/${YOUR_GITHUB_USER}/${YOUR_REPO_NAME}/contents/music`;
        const response = await fetch(repoUrl);
        const data = await response.json();
        
        playlist = data
            .filter(file => file.name.toLowerCase().endsWith('.mp3'))
            .map(file => ({ name: file.name, url: file.download_url }));
            
        renderPlaylist(playlist);
        status.innerText = `✅ Đã sẵn sàng: ${playlist.length} bài!`;
    } catch (err) {
        status.innerText = "❌ Lỗi: Không tìm thấy nhạc! Kiểm tra lại tên User/Repo.";
    }
}

function renderPlaylist(list) {
    playlistDiv.innerHTML = "";
    list.forEach((file, index) => {
        const div = document.createElement('div');
        div.className = 'song-item';
        div.innerText = `${index + 1}. ${file.name.replace('.mp3', '')}`;
        div.onclick = () => selectSong(div, file.url);
        playlistDiv.appendChild(div);
    });
}

function selectSong(element, url) {
    document.querySelectorAll('.song-item').forEach(i => i.classList.remove('active'));
    element.classList.add('active');
    selectedUrl = url;
    audio.src = url;
    audio.play();
    playBtn.innerText = "TẠM DỪNG";
    status.innerText = "🔥 Đang phát: " + element.innerText;
}

function handlePlay() {
    if (!selectedUrl) return alert("Chọn nhạc đi bro!");
    if (audio.paused) { audio.play(); playBtn.innerText = "TẠM DỪNG"; }
    else { audio.pause(); playBtn.innerText = "PHÁT NHẠC"; }
}

function handleLoop() {
    isLooping = !isLooping;
    audio.loop = isLooping;
    loopBtn.innerText = isLooping ? "LẶP: BẬT" : "LẶP: TẮT";
}

function filterSongs() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const items = document.querySelectorAll('.song-item');
    items.forEach(item => {
        item.style.display = item.innerText.toLowerCase().includes(term) ? "" : "none";
    });
}

// HÀM QUAN TRỌNG ĐỂ VÀO APP
function startApp() {
    document.getElementById('intro-page').style.display = 'none';
    autoLoadFromGitHub();
}

audio.onended = () => {
    if (!isLooping) {
        let items = document.querySelectorAll('.song-item');
        let currentIndex = Array.from(items).findIndex(i => i.classList.contains('active'));
        let nextIndex = (currentIndex + 1) % items.length;
        items[nextIndex].click();
    }
};
