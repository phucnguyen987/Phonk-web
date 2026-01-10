const audio = document.getElementById('mainAudio');
const playlistDiv = document.getElementById('customPlaylist');
const status = document.getElementById('status');
const playBtn = document.getElementById('playBtn');
const loopBtn = document.getElementById('loopBtn');

let playlist = [];
let selectedUrl = "";
let isLooping = false;

// ĐÂY LÀ CHỖ BẠN CẦN THAY ĐỔI
// Hãy thay 'TEN_CUA_BAN' và 'TEN_KHO_NHAC' bằng tên thật trên GitHub của bạn
const YOUR_GITHUB_USER = 'phucnguyen987'; 
const YOUR_REPO_NAME = 'Phonk-web';

async function autoLoadFromGitHub() {
    status.innerText = "ĐANG LOAD NHẠC...";
    try {
        const repoUrl = `https://api.github.com/repos/${phucnguyen987}/${Phonk-web}/contents/music`;
        
        const response = await fetch(repoUrl);
        if (!response.ok) throw new Error();
        
        const data = await response.json();
        
        // Tự động lấy các file có đuôi .mp3
        playlist = data
            .filter(file => file.name.toLowerCase().endsWith('.mp3'))
            .map(file => ({
                name: file.name,
                download_url: file.download_url
            }));
            
        renderPlaylist(playlist);
        status.innerText = `✅ ĐÃ LOAD XONG: ${playlist.length} bài!`;
    } catch (err) {
        status.innerText = "❌ Lỗi: Kiểm tra lại tên User hoặc Repo!";
        console.error(err);
    }
}

function renderPlaylist(list) {
    playlistDiv.innerHTML = "";
    list.forEach((file, index) => {
        const div = document.createElement('div');
        div.className = 'song-item';
        div.innerText = `${index + 1}. ${file.name.replace('.mp3', '')}`;
        div.onclick = () => selectSong(div, file.download_url);
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
    status.innerText = "🔥ĐANG PHÁT BÀI: " + element.innerText;
}

function handlePlay() {
    if (!selectedUrl) return alert("Chọn nhạc đã bro!");
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
}

function filterSongs() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const items = document.querySelectorAll('.song-item');
    items.forEach(item => {
        item.style.display = item.innerText.toLowerCase().includes(term) ? "" : "none";
    });
}

function startApp() {
    document.getElementById('intro-page').style.display = 'none';
    autoLoadFromGitHub();
}

audio.onended = function() {
    if (!isLooping) {
        let items = document.querySelectorAll('.song-item');
        let currentIndex = -1;
        items.forEach((item, index) => {
            if (item.classList.contains('active')) currentIndex = index;
        });
        let nextIndex = (currentIndex + 1) % items.length;
        items[nextIndex].click();
    }
};
