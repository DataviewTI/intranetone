<div class='user-infos'>
	<span class="user_name_max pull-right mr-1">{{ Sentinel::getUser()->first_name }} {{ Sentinel::getUser()->last_name }}</span>
	@if(Sentinel::getUser()->pic)
		<img src="{!! url('/').'/uploads/users/'.Sentinel::getUser()->pic !!}" alt="img" height="24px" width="24px" class="img-circle img-responsive pull-right"/>
	@else
		<img src="{!! asset('io/images/user-default-pic.png') !!} " width="24" class="img-circle img-responsive pull-right" height="24" alt="riot">
	@endif
	<div class="box">
		<div class="row h-100 w-100">
			<div class="col h-100">
					@if(Sentinel::getUser()->pic)
						<div class="img-container" style="background-image: url('".{!! url('/').'/uploads/users/'.Sentinel::getUser()->pic !!}."')"></div>
						{{-- <img src="{!! url('/').'/uploads/users/'.Sentinel::getUser()->pic !!}" alt="img" class="img-responsive h-100 w-auto"/> --}}
					@else
						<div class="img-container" style="background-image: url('/io/images/user-default-pic.png')"></div>
						{{-- <img src="{!! asset('io/images/user-default-pic.png') !!} " class="img-responsive h-100 w-auto" alt="riot"> --}}
					@endif
			</div>
			<div class="col h-100 p-0 my-auto">
				<a href="" id="edit-profile" class="d-inline-block text-white">Editar perfil</a>
				<a href="/admin/logout" class="d-inline-block pt-2 text-white">Sair</a>
			</div>
		</div>
	</div>
</div>
