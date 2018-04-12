@php
  use Dataview\IntranetOne\IntranetOneController;

  $menuItems = [];	

  
  $servs = IntranetOneController::getServices();

  foreach($servs as $s){
    if(Sentinel::getUser()->hasAccess(str_slug($s->service).".*"))
      array_push($menuItems,[
          "title"		=>$s->service,
          "icon"	=>"ico ico-save",
          "href"		=>"/admin/".str_slug($s->service),
        ]
      );
  }

  array_push($menuItems,[
			"href"		=>"/admin/logout",
			"title"		=>"Sair",
			"icon"	=>"ico ico-close"
		]);

	@endphp
			
	@component('IntranetOne::io.components.dash-menu-item',[
		"_items"=> 	$menuItems,	
	])
	@endcomponent