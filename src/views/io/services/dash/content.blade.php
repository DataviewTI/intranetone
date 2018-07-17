@php
  use Dataview\IntranetOne\IntranetOneController;
  $servs = IntranetOneController::getServices();
@endphp

<div class = 'd-flex m-auto h-100'>

@foreach($servs as $s)
  @if(Sentinel::getUser()->hasAccess(str_slug($s->alias).".*"))
  <div class = 'b-red m-auto' style = 'height:200px; width:400px'>
    asas
  </div>
  @endif
@endforeach

</div>