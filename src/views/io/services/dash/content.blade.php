@php
  use Dataview\IntranetOne\IntranetOneController;
  $servs = IntranetOneController::getServices();
  use Illuminate\Support\Str;

@endphp

<div class = 'row'>

  @foreach($servs as $s)
    @if(Sentinel::getUser()->hasAccess(Str::slug($s->alias).".*"))
    <div class = 'dash-item col-2' style = ''>
      <a class="w-100" href={{ "/admin/".Str::slug($s->alias) }}>
        <div class="item-box w-100">  
          <i class="ico {{ $s->ico }} my-auto "></i>
          <span class='mt-3'>{{ $s->trans }}</span>
        </div>
      </a>
    </div>
    @endif
  @endforeach

</div>