<div class='user-infos'>
	{{-- @if(Sentinel::getUser()->pic)
		<img src="{!! url('/').'/uploads/users/'.Sentinel::getUser()->pic !!}" alt="img" height="24px" width="24px" class="img-circle img-responsive pull-right"/>
	@else
		<img src="{!! asset('img/user-no-image.png') !!} " width="24" class="img-circle img-responsive pull-right" height="24" alt="riot">
	@endif --}}
	<span class="user_name_max pull-right">Usuário: {{ Sentinel::getUser()->first_name }} {{ Sentinel::getUser()->last_name }}</span>
</div>
