// const API_KEY = "AIzaSyBx3eeXbT6w1m0QIgqV-lAKTCLtLiZ4Kc8";
const API_KEY="AIzaSyAF0QfU6kfbuWLwttpQk0WxCEQirE6lxFs"

// Fetch video data from YouTube API
async function fetchYouTubeData(query) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&part=snippet,id&order=date&maxResults=40&q=${query}&regionCode=IN`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch YouTube data");
    }
    const data = await response.json();
    const videoItems = await fetchVideoDetails(data.items);
    displayVideos(videoItems);
  } catch (error) {
    console.error("Error fetching YouTube data:", error);
  }
}


// Fetch video details including statistics (likes, views) and channel details (channel logo)
async function fetchVideoDetails(items) {
  const videoIds = items
    .filter((item) => item.id && item.id.videoId)
    .map((item) => item.id.videoId)
    .join(",");

  if (videoIds.length === 0) {
    return [];
  }

  const videoResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&part=snippet,statistics&id=${videoIds}`
  );
  if (!videoResponse.ok) {
    throw new Error("Failed to fetch video details");
  }
  const videoData = await videoResponse.json();

  // Fetch channel details
  const channelIds = videoData.items
    .map((item) => item.snippet.channelId)
    .join(",");

  const channelResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?key=${API_KEY}&part=snippet&id=${channelIds}`
  );
  if (!channelResponse.ok) {
    throw new Error("Failed to fetch channel details");
  }
  const channelData = await channelResponse.json();
  const channelDetails = channelData.items.reduce((acc, channel) => {
    acc[channel.id] = channel.snippet.thumbnails.default.url;
    return acc;
  }, {});


  // Combine video data with channel logo
  return videoData.items.map((video) => ({
    ...video,
    channelLogo: channelDetails[video.snippet.channelId],
  }));
}


// Display videos in HTML
function displayVideos(videos) {
  const videosContainer = document.getElementById("videos-container");
  videosContainer.innerHTML = "";
  videosContainer.classList.add("videos-container");

  videos.forEach((video) => {
    const videoId = video.id;
    const title = video.snippet.title;
    const description = video.snippet.description;
    const thumbnail = video.snippet.thumbnails.medium.url;
    const publishDate = new Date(video.snippet.publishedAt);
    const formattedDate = formatUploadDate(publishDate);
    const views = video.statistics.viewCount;
    let likes;
    if (video.statistics.likeCount === undefined) {
      likes = "hidden";
    } else {
      likes = video.statistics.likeCount;
    }
    const channelLogo = video.channelLogo;

    const videoElement = document.createElement("div");
    videoElement.classList.add("video");
    videoElement.innerHTML = `
            <a href="player.html?videoId=${videoId}" target="_blank">
                <img src="${thumbnail}" alt="${title}" class="video-thumbnail">
            </a>
            <div>
                <div class="logoAndtitle">
                <img id="channelLogo" src="${channelLogo}" alt="Channel Logo" class="channel-logo">
                <h3 id="title" >${title}</h3>
                
                </div>
                <hr/>
                
                <p id="uploaded"><b>Uploaded</b>: ${formattedDate}</p>
                <hr/>
                <div id="VLcontainer">
                    <p><b>Views:</b> ${views}</p>
                    <p><b>Likes:</b> ${likes}</p>
                </div>
            </div>
        `;
    videosContainer.appendChild(videoElement);
  });
}


// Format upload date
function formatUploadDate(publishDate) {
  const options = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return publishDate.toLocaleString("en-US", options);
}


// Search videos based on user input
function searchVideos() {
  const query = document.getElementById("search-input").value.trim();
  if (query.length > 0) {
    fetchYouTubeData(query);
  }
}


// Execute search when Enter key is pressed in search input
const searchInput = document.getElementById("search-input");
searchInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    searchVideos();
  }
});


// Fetch data on page load
window.onload = function () {
  fetchYouTubeData("");
};


// Handle tab clicks
const tabButtons = document.querySelectorAll(".tab-button");
tabButtons.forEach((button) => {
  button.addEventListener("click", function () {
    tabButtons.forEach((btn) => btn.classList.remove("active-tab"));
    this.classList.add("active-tab");
    searchVideos(this.getAttribute("data-query"));
  });
});

//change place golder every 2sec

document.addEventListener('DOMContentLoaded', () => {
  const placeholders = ["Movies", "News", "Politics", "Entertainment", "Music"];
  const colors = ['red', 'blue', 'green', 'yellow', 'orange'];
  let currentIndex = 0;
  let letterIndex = 0;
  const inputElement = document.getElementById('search-input');
  let placeholderIntervalId;
  let letterIntervalId;

//for placeholder

  function changePlaceholder() {
      letterIndex = 0; // Reset letter index for the new word
      updatePlaceholderColor(colors[currentIndex]);
      inputElement.placeholder = ''; // Reset the placeholder
      letterIntervalId = setInterval(addLetter, 100); // Add letters every 200ms
  }

  function addLetter() {
      const currentPlaceholder = placeholders[currentIndex];
      if (letterIndex < currentPlaceholder.length) {
          inputElement.placeholder += currentPlaceholder[letterIndex];
          letterIndex++;
      } else {
          clearInterval(letterIntervalId); // Stop adding letters when done
          currentIndex = (currentIndex + 1) % placeholders.length;
          setTimeout(changePlaceholder, 2000); // Wait 2 seconds before changing to the next placeholder
      }
  }

  function updatePlaceholderColor(color) {
      const style = document.createElement('style');
      style.innerHTML = `
          ::placeholder {
              color: ${color};
              opacity: 1;
          }
          
         
          :-ms-input-placeholder { 
              color: ${color};
              opacity: 1;
          }
          
          ::-ms-input-placeholder { 
              color: ${color};
              opacity: 1;
          }
          
          ::-webkit-input-placeholder { /* WebKit browsers */
              color: ${color};
              opacity: 1;
          }
      `;
      document.head.appendChild(style);
  }

  function startChangingPlaceholder() {
      changePlaceholder(); // Start immediately
  }

  function stopChangingPlaceholder() {
      clearInterval(placeholderIntervalId);
      clearInterval(letterIntervalId);
  }

  // Start changing placeholder initially
  startChangingPlaceholder();

  // Ensure the placeholder keeps changing even when the input is focused
  inputElement.addEventListener('focus', stopChangingPlaceholder);
  inputElement.addEventListener('blur', startChangingPlaceholder);

  // Initial color setup
  updatePlaceholderColor(colors[currentIndex]);
});

//code for theme switch

document.addEventListener('DOMContentLoaded',(event)=>{
  const togglebtn=document.getElementById('toggle')
  
  const currentTheme=localStorage.setItem('theme')
  if(currentTheme==='dark'){
      document.body.classList.add('dark-mode')
  
  }
  
  togglebtn.addEventListener('click',()=>{
      document.body.classList.toggle('dark-mode')
      let theme='light'
      if(document.body.classList.contains('dark-mode')){
          theme='dark'
      }
      localStorage.setItem('theme',theme)
  })
  
  })