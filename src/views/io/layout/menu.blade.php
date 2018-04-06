@php
    $menuItems = [];	

	if(Sentinel::getUser()->hasAnyAccess(['news.create', 'news.view', 'news.update', 'news.delete']))
		array_push($menuItems,[
				"title"		=>"Notícias",
				"icon"	=>"ico ico-save",
				"href"		=>"admin/news",
			]
		);
		

	if(Sentinel::getUser()->hasAnyAccess(['user.create', 'user.view', 'user.update', 'user.delete']))
		array_push($menuItems,[
		"title"	=> "Usuários",
		"icon"	=> "ico ico-gear",
		"href"		=>"admin/users",
		]);
    
    //URL::to('/').
    
    array_push($menuItems,[
		"title"	=> "Configurações",
		"icon"	=> "ico ico-gear",
		"href"		=>"admin/profile",
		]);


		array_push($menuItems,[
			"href"		=>"admin/logout",
			"title"		=>"Sair",
			"icon"	=>"ico ico-save"
		]
	);

	@endphp
			
	@component('io.components.dash-menu-item',[
		"_items"=> 	$menuItems,	
	])
	@endcomponent