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
  
      $odin = Sentinel::registerAndActivate(array(
        'email'       => 'odin@dataview.com.br',
        'password'    => "yv7scr",
        'first_name'  => 'Odin',
        'last_name'   => 'Dataview',
      ));

      $admin = Sentinel::registerAndActivate(array(
        'email'       => 'admin@dataview.com.br',
        'password'    => "yv7scr",
        'first_name'  => 'Admin',
        'last_name'   => 'Dataview',
      ));
    
      $user = Sentinel::registerAndActivate(array(
        'email'       => 'user@dataview.com.br',
        'password'    => "yv7scr",
        'first_name'  => 'User',
        'last_name'   => 'Dataview',
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


      $odinRole = Sentinel::getRoleRepository()->createModel()->create([
        'name' => 'Odin',
        'slug' => 'odin',
        'permissions' => array('odin' => true),
      ]);	

      $odinRole->permissions = [
        'dash.view' => true,
      ];
      $odin->save();

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
      $odin->roles()->attach($odinRole);

      $this->command->info('Usuários Odin/Admin/USer padrão odin/admin/user@dataview.com.br criados, senha: yv7scr');
    }
}
