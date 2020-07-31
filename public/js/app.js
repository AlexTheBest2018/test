var app;

const comment = Vue.component('comment', {
  props: ['comment', 'commnetlikes'],
  template: `
  <li>
    <div class="row">
      <div class="col-8 d-flex">
           <p class="card-text"> {{comment.user.personaname + ' - '}}<small class="text-muted">{{comment.text}}</small></p>
      </div>
      <div class="col-4">
          <div class="pull-right reply"> <a href="#" @click.prevent="showForm(true)"><span><i class="fa fa-reply"></i> reply</span></a> </div>
      </div>
    </div>
    <div class="likes" @click="addCommentLike(comment.id)">
      <div class="heart-wrap" v-if="!commnetLikes">
        <div class="heart">
          <svg class="bi bi-heart" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M8 2.748l-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 01.176-.17C12.72-3.042 23.333 4.867 8 15z" clip-rule="evenodd"/>
          </svg>
        </div>
        <span>{{comment.commnet_likes}}</span>
      </div>
      <div class="heart-wrap" v-else>
        <div class="heart">
          <svg class="bi bi-heart-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z" clip-rule="evenodd"/>
          </svg>
        </div>
        <span>{{commnetLikesLocal}}</span>
      </div>
      <div class="alert alert-danger alert-dismissible fade show" v-if="isError" role="alert">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        {{error}}
      </div>
    </div>
    <form class="form-inline" v-if="showFormLocal">
      <div class="form-group">
        <input type="text" class="form-control" id="addComment" v-model="childrenText">
      </div>
      <button type="submit" class="btn btn-primary" @click.prevent="replyToComment(comment.id)">Add comment</button>
      <button type="button" class="btn btn-warning" @click.prevent="showForm(false)">Cancel</button>
    </form>
    <ul>
      <comment v-for="comment in comment.comment_children" :commnetlikes="commnetLikes" :key="comment.id" v-bind:comment="comment"></comment>
    </ul>
  </li>`,
  data () {
    return {
      showFormLocal: false,
      childrenText: '',
      commnetLikesLocal: this.commnetlikes,
      commentLokal: this.comment,
      error: '',
      isError: false,
    }
  },
  methods: {
    replyToComment: function (parent_id = 0) {
      let self = this;
      self.showFormLocal = false;
      self.childrenText = this.childrenText;
      var formdata=new FormData();
      formdata.set("post_id",self.$root.post.id);
      formdata.set("parent_id",parent_id);
      formdata.set("commentText",self.childrenText);
      axios.post('/main_page/comment', formdata)
        .then(function (response) {
          self.$root.post.coments = response.data.post.coments;
          self.childrenText = '';
        })
    },
    addCommentLike: function (id) {
      let self = this;
      axios
        .get('/main_page/like/comment/' + id)
        .then(function (response) {
          if(response.data.status !== 'error'){
            self.commnetLikesLocal = response.data.likes;
            self.comment.commnet_likes =  response.data.likes
          } else {
            self.error = response.data.error_message;
            self.isError = true;
          }
        })
    },
    showForm: function (isShow) {
      let self = this;
      self.showFormLocal = isShow;
    }
  }
});

app = new Vue({
	el: '#app',
	data: {
		login: '',
		pass: '',
    showForm: false,
		post: false,
		invalidLogin: false,
		invalidPass: false,
		invalidSum: false,
    isError: false,
    error: '',
    isAuthError: false,
    authError: '',
    loginError: '',
		posts: [],
		addSum: 0,
		amount: 0,
		likes: 0,
    balance: 0,
    likeBalance: 0,
    commnetlikes: 0,
		commentText: '',
		packs: [
			{
				id: 1,
				price: 5
			},
			{
				id: 2,
				price: 20
			},
			{
				id: 3,
				price: 50
			},
		],
	},
	computed: {
		test: function () {
			var data = [];
			return data;
		}
	},
  created() {
    var self = this;
		axios
			.get('/main_page/get_all_posts')
			.then(function (response) {
				self.posts = response.data.posts;
      });
    axios
      .get('/main_page/get_user_data')
      .then(function (response) {
        if(response.data.user){
          self.balance = response.data.user.balance;
          self.likeBalance = response.data.user.likeBalance;
        }
			})
	},
  components: {
    comment
  },
	methods: {
		logout: function () {
      console.log('logout');
		},
		logIn: function () {
      var self = this;
      if (self.login === '') {
				self.invalidLogin = true
      } else if (self.pass === '') {
        self.invalidLogin = false;
        self.invalidPass = true;
      } else {
        self.invalidLogin = false;
        self.invalidPass = false;
        let formdata=new FormData();
        formdata.set('login', self.login);
        formdata.set('pass', self.pass);
        axios.post('/main_page/login', formdata)
					.then(function (response) {
            if(response.data.status !== 'error'){
						setTimeout(function () {
							$('#loginModal').modal('hide');
                location.reload();
						}, 500);
            } else {
              self.loginError = response.data.error_message;
              $('.alert').on('closed.bs.alert', function () {
                self.loginError = '';
              })
            }
					})
			}
		},
		fiilIn: function () {
      var self = this;
      let formdata=new FormData();
      if (self.addSum === 0) {
        self.invalidSum = true;
      } else {
        self.invalidSum = false;
        formdata.set("sum",self.addSum);
        axios.post('/main_page/add_money', formdata)
					.then(function (response) {
            self.balance = response.data.amount;
						setTimeout(function () {
							$('#addModal').modal('hide');
						}, 500);
					})
			}
		},
		openPost: function (id) {
      var self = this;
			axios
				.get('/main_page/get_post/' + id)
				.then(function (response) {
					self.post = response.data.post;
          if (self.post) {
						setTimeout(function () {
							$('#postModal').modal('show');
						}, 500);
					}
				})
		},
		addLike: function (id) {
      var self = this;
			axios
        .get('/main_page/like/post/' + id)
				.then(function (response) {
          if(response.data.status !== 'error'){
					self.likes = response.data.likes;
            self.likeBalance = response.data.likes;
          } else {
            self.error = response.data.error_message;
            self.isError = true;
          }
				})
		},
		buyPack: function (id) {
      var self = this;
      let formdata=new FormData();
      formdata.set('id', id);
      axios.post('/main_page/buy_boosterpack', formdata)
				.then(function (response) {
          if(response.data.status !== 'error'){
            self.amount = response.data.likes;
            self.likeBalance = response.data.likeBalance;
            self.balance = response.data.balance;
            if (self.amount !== 0) {
						setTimeout(function () {
							$('#amountModal').modal('show');
						}, 500);
					}
          } else {
            console.log(response.data.error_message)
          }
				})
    },
    addcomment: function (parent_id = 0) {
      var self = this;
      var formdata=new FormData();
      formdata.set("post_id",self.post.id);
      formdata.set("parent_id",parent_id);
      formdata.set("commentText",self.commentText);
      axios.post('/main_page/comment', formdata)
        .then(function (response) {
          if(response.data.status !== 'error'){
            self.post.coments = response.data.post.coments;
            self.commentText = '';
          } else {
            self.authError = response.data.error_message;
            self.isAuthError = true;
		}
        })
    },
	}
});
