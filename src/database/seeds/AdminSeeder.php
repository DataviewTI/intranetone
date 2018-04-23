<?php
namespace Dataview\IntranetOne;

use Illuminate\Database\Seeder;
use Sentinel;


class AdminSeeder extends Seeder
{
    public function run()
    {
      \DB::table('users')->truncate();
      \DB::table('roles')->truncate();
      \DB::table('role_users')->truncate();
      \DB::table('activations')->truncate();
  
      $admin = Sentinel::registerAndActivate(array(
        'email'       => 'dataview@dataview.com.br',
        'password'    => "yv7scr",
        'first_name'  => 'Dataview',
        'last_name'   => 'TI',
      ));
    
      $adminRole = Sentinel::getRoleRepository()->createModel()->create([
        'name' => 'Admin',
        'slug' => 'admin',
        'permissions' => array('admin' => true),
      ]);	

  
      $admin->roles()->attach($adminRole);
      $admin->permissions = [
        'dash.view' => true,
        'user.create' => true,
        'user.delete' => true,
        'user.update' => true,
        'user.view' => true,
        'news.create' => true,
        'news.delete' => true,
        'news.update' => true,
        'news.view' => true,
       ];
      $admin->save();
  
      $this->command->info('Usuário padrão dataview@dataview.com.br criado...');
    }
}
