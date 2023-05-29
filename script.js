const firebaseConfig = {
    apiKey: "AIzaSyBOYLiD7-nU86tVYkhk0CKvuD8Vpjvw4Bw",
    authDomain: "visu-38b3c.firebaseapp.com",
    databaseURL: "https://visu-38b3c-default-rtdb.firebaseio.com",
    projectId: "visu-38b3c",
    storageBucket: "visu-38b3c.appspot.com",
    messagingSenderId: "452302912187",
    appId: "1:452302912187:web:1b5c765071846f2a39079e"
};

firebase.initializeApp(firebaseConfig);
var database = firebase.database();

var videos = [];

// Recuperar os dados do Firebase quando a página carregar
window.addEventListener('load', function() {
    database.ref('videos').once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var video = childSnapshot.val();
            videos.unshift(video); // Adicionar no início do array

            var videoContainer = document.createElement("div");
            videoContainer.className = "col-md-6 video-container";
            videoContainer.setAttribute("data-video-id", video.id);

            var iframe = document.createElement("iframe");
            iframe.src = "https://www.youtube.com/embed/" + video.id;
            iframe.width = "100%";
            iframe.height = "315";
            iframe.allowFullscreen = true;
            iframe.frameborder = 0;
            videoContainer.appendChild(iframe);

            var videosDiv = document.getElementById("videos");
            videosDiv.insertBefore(videoContainer, videosDiv.firstChild); // Inserir o vídeo no início da lista

            video.notas.forEach(function(notaText) {
                adicionarNovaNota(video, notaText); // Adicionar as notas do vídeo
            });
        });
    });
});

function adicionarVideo() {
    var videoLink = document.getElementById("videoLink").value;
    var videoId = extrairVideoId(videoLink);
    var videosDiv = document.getElementById("videos");

    var videoContainer = document.createElement("div");
    videoContainer.className = "col-md-6 video-container";
    videoContainer.setAttribute("data-video-id", videoId);

    var iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube.com/embed/" + videoId;
    iframe.width = "100%";
    iframe.height = "315";
    iframe.allowFullscreen = true;
    iframe.frameborder = 0;
    videoContainer.appendChild(iframe);

    // Adicionar vídeo ao array de vídeos
    var video = {
        id: videoId,
        notas: []
    };
    videos.unshift(video); 

    videosDiv.insertBefore(videoContainer, videosDiv.firstChild); 

    adicionarNovaNota(video);
    salvarNoFirebase(video);
}

function extrairVideoId(videoLink) {
    var regex = /(?:\?v=|&v=|youtu\.be\/|\/v\/|\/embed\/|\/videos\/|user\/\S+|\/v=|\/e\/|watch\?v=|\&v=|v%3A|v\/|e\/|youtube\.com\/v\/)([^#\&\?\/]{11})/;
    var match = videoLink.match(regex);
    return match ? match[1] : null;
}


function adicionarNovaNota(video, notaText) {
    const videosDiv = document.getElementById("videos");
    const videoContainer = videosDiv.querySelector(`[data-video-id="${video.id}"]`);

    const nota = document.createElement('div');
    nota.classList.add('nota');

    nota.innerHTML = `
        <div class="configuracao">
            <button class="editar">
                <i class="fas fa-edit"></i>
            </button>
            <button class="deletar" data-video-id="${video.id}">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
        <div class="main hidden"></div>
        <textarea></textarea>
    `;

    const btnEditar = nota.querySelector('.editar');
    const btnDeletar = nota.querySelector('.deletar');
    const main = nota.querySelector('.main');
    const textArea = nota.querySelector('textarea');

    btnDeletar.addEventListener('click', () => {
        nota.remove();
        videoContainer.remove();
        videos = videos.filter(v => v.id !== video.id);
        deletarDoFirebase(video);
    });

    main.classList.toggle('hidden');
    textArea.classList.toggle('hidden');
    btnEditar.addEventListener('click', () => {
        main.classList.toggle('hidden');
        textArea.classList.toggle('hidden');
        if (!textArea.classList.contains('hidden')) {
            textArea.value = main.innerText; 
        }
        salvarNoFirebase(video);
    });

    textArea.addEventListener('input', (e) => {
        main.innerHTML = marked(e.target.value);
        video.notas[0] = e.target.value; 
    });

    if (notaText && notaText.trim() !== '') {
        main.innerHTML = marked(notaText); 
        textArea.value = notaText; 
    }

    videoContainer.appendChild(nota);
}


function salvarNoFirebase(video) {
    database.ref('videos/' + video.id).set(video);
}

function deletarDoFirebase(video) {
    database.ref('videos/' + video.id).remove();
}
