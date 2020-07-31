# Codeigniter3

We just make better shit, rather than comminity :) Myabe we should call it Shadowigniter ? :)

![](https://media1.tenor.com/images/64e1b9b4745048fb2d51d23f241298ee/tenor.gif?itemid=10523126)

# REQUIRMENTS

AT LEAST PHP7.1 ! Best: PHP7.3


# How to?

Init repo settings with file `.gitmodules`
```
[submodule "Codeigniter3"]
	path = system
	url = https://github.com/TheFrozenThrone/Codeigniter3.git
```
maybe?
`GIT_SSH_COMMAND="ssh -i ssh/id_system" git submodule update --init --remote`


Repo is private, so you should use SSH Key to access repo:



`GIT_SSH_COMMAND="ssh -i ssh/id_system" git submodule init`

then update your modules ( first pull ):

`GIT_SSH_COMMAND="ssh -i ssh/id_system" git submodule update`

after, each time 

`GIT_SSH_COMMAND="ssh -i /var/www/project_folder(s)/ssh/id_system" git submodule update --remote`


to push newer version to your repo:


`git submodule update --force --remote && git commit -a -m "Update Codeigniter3 Core!" && git push`


Extending feature: Class Core in lib! 

For autodeploy we should use autodeploy - machine user! 

Submodule authentication => https://www.deployhq.com/blog/using-submodules-in-deploy

https://developer.github.com/v3/guides/managing-deploy-keys/

### PHPSTORM - SHIT 

Its not working. Totally, normaly . 

![](https://i.gyazo.com/60b26ad21df10a278a6f22a8814a570d.png) 

Disable this, in main project. If you want to update core , use function upper. If you want to struggle with PHPSTORM shit - try this.

Update check branches, then commit any files. Then! Maybe there will be update and phpstorm will see new system revision and you can push it!

Or try just click pull button ! 

![](https://i.gyazo.com/501142f2b96401adf77c341a3d159d37.png)

### Loader extending

If you want to use subdomain by one application folder, define

`define('PROJECT', isset($_SERVER['CI_PROJECT']) ? $_SERVER['CI_PROJECT'] : 'main');`

`define('PROJECT_CONFIG_PATH', PROJECT . '/');`

If you want to use global config folder for them: 

`define('IS_GLOBAL_CONFIG', TRUE);` 

and put `config/global` folder to the project. ENVIRONMENT is supported everywhere!

### Env check

We added `is_dev` `is_prod` `is_testing` function :)

### SPA SUPPORT

We added `IS_SPA_APPLICATION`  constant checking for using method `->response_view()` to send information in JSON to Frontend.


### RESPONSE HELP FUNCTIONS

We added `response()` `response_success()` `response_error()` and same for CLI. `cli_response()` and etc Functions, to feel better when return some data.



### String features 

`contains()`, `isJSON()` helps to work with strings :) 


### Emerald_model 

Next generation model for CI !


Firstly you should Init Sparrow DB library - https://github.com/mikecao/sparrow from file: Library/Sparrow_starter.php . Easiest way to add to add to autoload. 

Simple use, lightweigt ORM ! Right now there is no proper docs how use it.

### Getters and Setters for PHPSTORM for Emerald_model

```
/**
* @return ${TYPE_HINT}
*/
public ${STATIC} function ${GET_OR_IS}_${FIELD_NAME}()#if(${RETURN_TYPE}): ${RETURN_TYPE}#else#end
{
#if (${STATIC} == "static")
    return self::$${FIELD_NAME};
#else
    return $this->${FIELD_NAME};
#end
}

```

```
/**
* @param ${TYPE_HINT} $${PARAM_NAME}
*
* @return bool
*/
public ${STATIC} function set_${FIELD_NAME}(#if (${SCALAR_TYPE_HINT})${SCALAR_TYPE_HINT} #else#end$${PARAM_NAME})
{
#if (${STATIC} == "static")
    self::$${FIELD_NAME} = $${PARAM_NAME};
#else
    $this->${FIELD_NAME} = $${PARAM_NAME};
#end
    return $this->save('${FIELD_NAME}', $${PARAM_NAME});
}
```