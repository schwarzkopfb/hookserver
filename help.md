##Usage

    hookserver <command> [<subcommand>] [<value1>] [<value2>] [options]

##Commands

###<code>add hook &lt;name&gt; &lt;scriptPath&gt;</code>
Register a named webhook.  

**name**: Name of the hook.  
**scriptPath**: File path pointing to a bash script to be executed when the webhook is triggered. 

###<code>add key [&lt;key&gt;] [-l]</code>
Register a new security key and save its md5 hash.
This key allows access to any registered webhook on this server.
You can use multiple keys at the same time.

**key**: The key itself. If not provided, a random-generated key will be added and displayed.  
 
**-l, --length**: If no key provided, you can set the length of the random-generated key with this option.  

###<code>update hook &lt;name&gt; &lt;scriptPath&gt;</code>
Update a previously registered webhook.  
 
**name**: Name of the hook.  
**scriptPath**: File path pointing to the new bash script to be executed when the webhook is triggered.  

###<code>update key &lt;currentKey&gt; &lt;newKey&gt;</code>
Update a previously registered security key.  
 
**currentKey**: The key to be updated.  
**newKey**: The new key replacing the current one.  

###<code>remove hook &lt;name&gt;</code>
Unregister a previously added webhook.  
 
**name**: Name of the hook.  

###<code>remove key &lt;key&gt;</code>
Drop a previously added security key.  
 
**key**: The key to be dropped.  

###<code>list hooks</code>
Display a list of registered webhooks.  

###<code>list keys</code>
Display a list of stored md5 hashes generated from security keys.  

###<code>run &lt;hookName&gt;</code>                   
Trigger a webhook from commandline.  

**hookName**: Name of the hook to run.  

###<code>start [-d] [-p] [-l]</code>
Start up the webhook http server.  
 
**-d, --daemonize**: This option allows you to run the server in the background detached from this shell.  
**-p, --port**: Overwrite default port (6086).  
**-l, --log**: If running deamonized, you can set the log path of the server with this flag.  

###<code>stop [-f]</code>
Stop server daemon.  
 
**-f, --force**: Set this option to avoid waiting the server to close its open connections and stop it immediately.  

###<code>cleanup</code>
Delete all the registered hooks and keys.  
Warning: this action cannot be undone.  

###<code>version</code>
Show Hookserver version number.  

###<code>help</code>
Show this help.  

##Options:

###<code>-v, --version</code>  
Set this option without any command or subcommand to display Hookserver version number.  

###<code>-h, --help</code>  
Set this option without any command or subcommand to display this help.  