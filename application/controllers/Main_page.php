<?php

/**
 * Created by PhpStorm.
 * User: mr.incognito
 * Date: 10.11.2018
 * Time: 21:36
 */
class Main_page extends MY_Controller
{

    public function __construct()
    {
        parent::__construct();

        App::get_ci()->load->model('User_model');
        App::get_ci()->load->model('Login_model');
        App::get_ci()->load->model('Post_model');
        App::get_ci()->load->model('Comment_model');
        App::get_ci()->load->model('Boosterpack_model');
        App::get_ci()->load->model('Balance_log_model');

        if (is_prod())
        {
            die('In production it will be hard to debug! Run as development environment!');
        }
    }

    public function index()
    {
        $user = User_model::get_user();
        App::get_ci()->load->view('main_page', ['user' => User_model::preparation($user, 'default')]);
    }

    public function set_log_balance($balance, $key)
    {
        $user = User_model::get_user();
        $balance_spent = 0;
        $balance_add = 0;
        switch ($key){
            case 'spent':
                $balance_spent = $balance;
                break;
            case 'add':
                $balance_add = $balance;
                break;
        }
        $data = array(
            'user_id' => $user->get_id(),
            'wallet_balance' => $balance_add,
            'wallet_total_refilled' => $user->get_wallet_total_refilled(),
            'wallet_total_withdrawn' => $user->get_wallet_total_withdrawn(),
            'wallet_spent_balance' => $balance_spent,
        );
        $balance_log = new Balance_log_model();
        $balance_log::create($data);
    }

    public function get_user_data()
    {
        $user = User_model::get_user();
        if($user){
            return $this->response_success(['user' => User_model::preparation($user, 'main_page')]);
        }
    }

    public function get_all_posts()
    {
        $posts =  Post_model::preparation(Post_model::get_all(), 'main_page');
        return $this->response_success(['posts' => $posts]);
    }

    public function get_post($post_id){ // or can be $this->input->post('news_id') , but better for GET REQUEST USE THIS

        $post_id = intval($post_id);

        if (empty($post_id)){
            return $this->response_error(CI_Core::RESPONSE_GENERIC_WRONG_PARAMS);
        }

        try
        {
            $post = new Post_model($post_id);
        } catch (EmeraldModelNoDataException $ex){
            return $this->response_error(CI_Core::RESPONSE_GENERIC_NO_DATA);
        }


        $posts =  Post_model::preparation($post, 'full_info');
        return $this->response_success(['post' => $posts]);
    }


    public function comment(){ // or can be App::get_ci()->input->post('news_id') , but better for GET REQUEST USE THIS ( tests )
        $post_id = App::get_ci()->input->post('post_id');
        $parent_id = App::get_ci()->input->post('parent_id');
        $message = App::get_ci()->input->post('commentText');
        if (!User_model::is_logged()){
            return $this->response_error(CI_Core::RESPONSE_GENERIC_NEED_AUTH);
        }
        $user = User_model::get_user();
        $post_id = intval($post_id);

        if (empty($post_id) || empty($message)){
            return $this->response_error(CI_Core::RESPONSE_GENERIC_WRONG_PARAMS);
        }

        try
        {
            $post = new Post_model($post_id);
        } catch (EmeraldModelNoDataException $ex){
            return $this->response_error(CI_Core::RESPONSE_GENERIC_NO_DATA);
        }
        $data = array(
            'assign_id' => $post_id,
            'parent_id' => $parent_id,
            'text' => $message,
            'user_id' => intval($user->get_id()),
        );
        $comment = new Comment_model();
        $comment::create($data);
        $posts =  Post_model::preparation($post, 'full_info');
        return $this->response_success(['post' => $posts]);
    }

    public function login()
    {
        $login=App::get_ci()->input->post('login');
        $pass=App::get_ci()->input->post('pass');
        $user =  User_model::get_auth_user($login, $pass);
        if($user) {
            Login_model::start_session($user->get_id());
            redirect(site_url('/'));
            return $this->response_success(['user' => $user]);
        } else {
            return $this->response_error(CI_Core::RESPONSE_GENERIC_LOGIN_ERROR);
        }
    }


    public function logout()
    {
        Login_model::logout();
        redirect(site_url('/'));
    }

    public function add_money(){
        if (!User_model::is_logged()){
            return $this->response_error(CI_Core::RESPONSE_GENERIC_NEED_AUTH);
        }

        $sum=floatval(App::get_ci()->input->post('sum'));
        if (empty($sum)){
            return $this->response_error(CI_Core::RESPONSE_GENERIC_WRONG_PARAMS);
        }

        $user = User_model::get_user();
        $user->set_wallet_balance($sum);
        $get_wallet_total_refilled = $user->get_wallet_total_refilled() + $sum;
        $user->set_wallet_total_refilled($get_wallet_total_refilled);

        $this->set_log_balance($sum, 'add');
        return $this->response_success(['amount' => $user->get_wallet_total_refilled()]);
    }

    public function buy_boosterpack(){
        if (!User_model::is_logged()){
            return $this->response_error(CI_Core::RESPONSE_GENERIC_NEED_AUTH);
    }

        $id=intval(App::get_ci()->input->post('id'));
        $boosterpack = new Boosterpack_model($id);
        $user = User_model::get_user();
        $price = $boosterpack->get_price();
        $bank = $boosterpack->get_bank();
        $result = rand(1, ($price + $bank));
        $bank = ($price - $result) + $bank;
        $wallet_total_refilled = $user->get_wallet_total_refilled();

        if($price > $wallet_total_refilled){
            return $this->response_error(CI_Core::RESPONSE_GENERIC_NOT_ENOUGH_MONEY);
        }

        $boosterpack->set_bank($bank);
        $user->set_wallet_total_refilled($wallet_total_refilled - $price);
        $user->set_wallet_total_withdrawn($user->get_wallet_total_withdrawn() + $price);
        $user->set_likes($user->get_likes() + $result);
        $this->set_log_balance($price, 'spent');
        return $this->response_success(['balance' => $user->get_wallet_total_refilled(), 'likes'=> $result, 'likeBalance'=>$user->get_likes()]);
    }


    public function like($entity, $id){
        if (!User_model::is_logged()){
            return $this->response_error(CI_Core::RESPONSE_GENERIC_NEED_AUTH);
        }

        $user = User_model::get_user();
        $user->set_likes($user->get_likes() - 1);
        $userLikes = $user->get_likes();
        if($userLikes < 1){
            return $this->response_error(CI_Core::DONT_HAVE_ENOUGH_LIKES);
        }
        $likes = 0;
        switch ($entity){
            case 'comment':
                $comment = new Comment_model($id);
                $comment->set_likes($comment->get_likes() + 1);
                $likes = $comment->get_likes();
                break;
            case 'post':
                $post = new Post_model($id);
                $post->set_likes($post->get_likes() + 1);
                $likes = $post->get_likes();
                break;
        }
        return $this->response_success(['likes' => $likes]); // Колво лайков под постом \ комментарием чтобы обновить
    }

}
