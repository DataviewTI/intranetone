@foreach($_items as $t)
	@php
		$has_subs = (isset($t['subitems']) && count($t['subitems'])>0);
    $sign =($has_subs && !isset($t['sign'])) ? '_'.str_random(6) : (($has_subs && isset($t['sign'])) || (isset($t['href']) && Request::is($t['href']) && isset($t['sign'])) ? $t['sign'] : null);
    
    $is_current_url = (isset($t['href']) && Request::path()==$t['href']) ? 1 : 0;

	@endphp
	<li class = "@if($is_current_url){{'_active'}}@endif mb-2">
		<a href="@if(isset($t['href'])){{$t['href']}}@else#@endif" class="py-2 d-flex d-inline-block w-100 @if($has_subs) has-arrow @endif"  sign="{{$sign}}" aria-expanded=false>
			@if(isset($t['icon']) && $t['icon']!=null)
			<i class="{{$t['icon']}} my-auto"></i>
			@endif
			<span class = 'my-auto'>{{$t['title']}}</span>
		</a>
		@if($has_subs)
			<ul>
			@foreach($t['subitems'] as $s)
					@component('IntranetOne::admin.layouts.components.metismenu-item',
					[
						"_items"=> [
							[
								"href"			=> isset($s['href']) ? $s['href'] : "",
								"title"			=> $s['title'],
								"icon"			=> isset($s['icon']) ? $s['icon'] : null,
								"subitems"	=> (isset($s['subitems']) && count($s['subitems'])>0) ? $s['subitems'] : [],
								"sign"	=> $sign
							]
						]
					])
					@endcomponent
			@endforeach
			</ul>
		@endif
		</li>
@endforeach						