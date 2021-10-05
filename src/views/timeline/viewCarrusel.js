const topPopularPosts = () => {
    const objectAllPosts = JSON.parse(window.localStorage.getItem('allPosts'));
    const orderedObject = objectAllPosts.sort((post1, post2) => post2.arrLikes.length - post1.arrLikes.length);
    const topSix = orderedObject.slice(0, 6) // Extraemos los seis post con más likes
    return topSix;
}

const loadViewPopularPost = () => {
    const orderedObject = topPopularPosts()
    const sliderPost = document.querySelector('.slider');

    orderedObject.forEach(element => {
        const cardPost = document.createElement('figure');
        cardPost.classList.add('card-post')
        cardPost.innerHTML = `
                    <div class="head-popularPosts">
                        <div class="imgUser">
                            <a href="#">
                            <img src="${element.photoUser}" alt="" class="post-author-pic">
                            </a>
                        </div>
                        <div class="name-hours">
                            <h5><span class="author-name"><a href="#"> ${element.nameUser} </a></span></h5>
                            <p <span class="post-date">${element.datePost}</span> </p>
                        </div>
                        <div class="heart-number">
                            <i class="fab fa-gratipay heart"></i>
                            <p> ${element.arrLikes.length > 0 ? element.arrLikes.length : 0} </p>
                        </div>
                    </div>
                    <div class="text-content">
                        <p class="p-posts"> ${element.contentPost.substring(0, 55)}... </p>
                    </div>
                    <div class="box-plus">
                        <img src="../../assets/images/imgPopularPosts/plus.png" alt="" class="plus"  href="#seccion1">
                    </div>`
        sliderPost.appendChild(cardPost);
    })
    return sliderPost;
}

export { loadViewPopularPost }