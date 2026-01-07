const audio = document.getElementById('mainAudio');
const seekSlider = document.getElementById('seekSlider');
const currentTimeText = document.getElementById('currentTime');
const durationTimeText = document.getElementById('durationTime');
const albumArt = document.getElementById('albumArt');
const currentTitle = document.getElementById('currentTitle');
const menuOverlay = document.getElementById('menuOverlay');

let playlist = [];

// THAY THÔNG TIN CỦA BẠN
const YOUR_GITHUB_USER = 'phucnguyen987'; 
const YOUR_REPO_NAME = 'Phonk-web';

// Đọc danh sách từ GitHub
async function autoLoadFromGitHub() {
    try {
        const response = await fetch(`https://api.github.com/repos/${YOUR_GITHUB_USER}/${YOUR_REPO_NAME}/contents/music`);
        const data = await response.json();
        playlist = data.filter(f => f.name.toLowerCase().endsWith('.mp3')).map(f => ({ name: f.name, url: f.download_url }));
        renderPlaylist(playlist);
    } catch (err) { alert("Lỗi nạp nhạc!"); }
}

function renderPlaylist(list) {
    const div = document.getElementById('customPlaylist');
    div.innerHTML = "";
    list.forEach((file) => {
        const item = document.createElement('div');
        item.className = 'song-item';
        item.innerText = file.name.replace('.mp3', '');
        item.onclick = () => { selectSong(item, file.url); toggleMenu(); };
        div.appendChild(item);
    });
}

function selectSong(element, url) {
    document.querySelectorAll('.song-item').forEach(i => i.classList.remove('active'));
    element.classList.add('active');
    currentTitle.innerText = element.innerText;
    audio.src = url;
    audio.play();
    document.getElementById('playBtn').innerText = "TẠM DỪNG";
    loadMetadata(url); // Lấy ảnh bìa
}

// Hàm lấy ảnh từ file MP3
function loadMetadata(url) {
    jsmediatags.read(url, {
        onSuccess: function(tag) {
            const image = tag.tags.picture;
            if (image) {
                let base64String = "";
                for (let i = 0; i < image.data.length; i++) {
                    base64String += String.fromCharCode(image.data[i]);
                }
                const base64 = "data:" + image.format + ";base64," + window.btoa(base64String);
                albumArt.src = base64;
            } else {
                albumArt.src = "https://cdn-icons-png.flaticon.com/512/3659/3659784.png";
            }
        },
        onError: function(error) { albumArt.src = "https://cdn-icons-png.flaticon.com/512/3659/3659784.png"; }
    });
}

// Điều khiển thanh tua
audio.ontimeupdate = () => {
    if (!isNaN(audio.duration)) {
        seekSlider.max = Math.floor(audio.duration);
        seekSlider.value = Math.floor(audio.currentTime);
        currentTimeText.innerText = formatTime(audio.currentTime);
        durationTimeText.innerText = formatTime(audio.duration);
    }
};

function seekTo() { audio.currentTime = seekSlider.value; }

function formatTime(seconds) {
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
}

function toggleMenu() {
    menuOverlay.style.display = menuOverlay.style.display === 'block' ? 'none' : 'block';
}

function handlePlay() {
    if (audio.paused) { audio.play(); document.getElementById('playBtn').innerText = "TẠM DỪNG"; }
    else { audio.pause(); document.getElementById('playBtn').innerText = "PHÁT"; }
}

function startApp() {
    document.getElementById('intro-page').style.display = 'none';
    autoLoadFromGitHub();
}
