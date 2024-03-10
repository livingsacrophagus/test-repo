const tweetButton = document.querySelector('#tweet-btn');
const tweetForm = document.querySelector('#tweet');
const tweetsTable = document.querySelector('#tweets-table');
const statusText = document.querySelector('.status-text');

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

const postTweet = async() => {
    try {
        statusText.style.color = "white";
        statusText.innerHTML = "Please wait...";
        statusText.style.visibility = "visible";
        const resp = await axios.post('/api/v1/tweets', { tweet: tweetForm.value });

        if (resp.data.success) {
            statusText.innerHTML = "Very nice, your tweet has been recorded";
            statusText.style.color = '#1ED931';
            let postedTweet = resp.data.data;

            if (!postedTweet) {
                statusText.innerHTML = "No tweets found";
                statusText.style.color = '#fa2525';
                return
            }

            let row = tweetsTable.insertRow();
            row.insertCell(0).innerHTML = postedTweet.tweetID;
            row.insertCell(1).innerHTML = escapeHtml(postedTweet.tweet);
        } else {
            statusText.innerHTML = resp.data.data;
            statusText.style.color = '#fa2525';
        }
    } catch (error) {
        statusText.style.color = '#fa2525';

        //Check if API has returned a custom response
        const errorMessage = error.response.data.data;
        if (errorMessage) {
            statusText.innerHTML = errorMessage;
        } else {
            statusText.innerHTML = 'Ooopsie! Something went wrong';
        }
    }
}
tweetButton.addEventListener('click', postTweet);