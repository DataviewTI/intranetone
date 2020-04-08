<ul class="dash-menu mt-2 h-100">
@php
  use Dataview\IntranetOne\IntranetOneController;
  use Illuminate\Support\Str;

  $menuItems = [];	

  
  $servs = IntranetOneController::getServices();

  // array_push($menuItems,[
	// 		"href"		=>"/admin/dash",
  //     "class" => "mt-2",
	// 		"title"		=>"Dashboard",
	// 		"icon"	=>"ico-dashboard"
	// 	]);
    
  foreach($servs as $s){
    if(Sentinel::getUser()->hasAccess(Str::slug($s->alias).".*"))
      array_push($menuItems,[
          "title"		=>$s->trans,
          "icon"	=>$s->ico,
          "href"		=>"/admin/".Str::slug($s->alias),
        ]
      );
  }

  array_push($menuItems,[
			"href"		=>"/admin/logout",
      "class" => "mt-5",
			"title"		=>"Sair",
			"icon"	=>"ico ico-logout"
		]);

	@endphp
			
	@component('IntranetOne::io.components.dash-menu-item',[
		"_items"=> 	$menuItems,	
	])
	@endcomponent
</ul>