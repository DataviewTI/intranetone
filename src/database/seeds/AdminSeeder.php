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
    
      $user = Sentinel::registerAndActivate(array(
        'email'       => 'mdisconzi@gmail.com',
        'password'    => "yv7scr",
        'first_name'  => 'Marcelo',
        'last_name'   => 'Disconzi',
      ));
      
      $adminRole = Sentinel::getRoleRepository()->createModel()->create([
        'name' => 'Admin',
        'slug' => 'admin',
        'permissions' => array('admin' => true),
      ]);	

      $adminRole->permissions = [
        'dash.view' => true,
      ];
      $adminRole->save();

      $userRole = Sentinel::getRoleRepository()->createModel()->create([
        'name' => 'User',
        'slug' => 'user',
        'permissions' => array('user' => true),
      ]);	

      $userRole->permissions = [
        'dash.view' => true,
       ];
      $user->save();

      $admin->roles()->attach($adminRole);
      $user->roles()->attach($userRole);

      $this->command->info('Usuário padrão dataview@dataview.com.br criado...');
    }
}
