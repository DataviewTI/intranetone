@php
  $categories = Dataview\IntranetOne\Category::select('id','category','category_id')
  ->whereHas('maincategory',function($q) use ($cat){
      $q->where('category',$cat);
  })
  ->get()
  ->split(3);
@endphp

<div class = 'row pt-2'>
  <div class="col-12 p-0">
    <h6><span class = 'ico ico-idea'></span> Arraste e solte as categorias no bloco verde, clicando no ícone <span class = 'ico ico-move' style ='color:red'></span>.  reordene se necessário para definir a categoria principal</h6>
  </div>
</div>

<div class = 'row justify-content-between'>
  <div class="col-5">
    <div class = 'form-group' style = 'margin:0; height:25px'>
    </div>
    <div class="list-group __sortable-list">
      <div class = 'row justify-content-between h-100'>
        @foreach($categories as $cats)
          <div class="col __sl-box-source h-100" id = '__sl-box-left-{{$loop->iteration}}'>
            @foreach($cats as $c)
              @if($c->parent==null)
                <button __val = "{{$c->id}}" __cat = "{{$c->category_id}}" type="button" class="list-group-item   list-group-item-action list-group-item-danger">
                  <span class = 'ico ico-move __sl-handle'></span> {{$c->category}}
                </button>
              @else
                <button __val = "{{$c->id}}" __cat = "{{$c->category_id}}" type="button" class="list-group-item list-group-item-action list-group-item-info">
                  <span class ='clearfix w-100'>
                    <span class = 'ico ico-move __sl-handle'></span>
                    {{$c->category}}
                    <span class = 'ico ico-move float-right __sl-info' data-html='true' data-toggle="tooltip" data-placement="top" title="subcategoria de &#60;b&#62;{{$c->parent->category}}&#60;&#47;b&#62;"></span>
                  </span>
                </button>
              @endif
            @endforeach
          </div>
        @endforeach
      </div>
    </div>
  </div>
  <div class="col-2 align-self-center text-center">
    <span class = 'ico ico-exchange __sl-spacer'></span>
  </div>
  <div class="col-5">
    <div class = 'form-group' style = 'margin:0; height:25px'>
      <input type = 'hidden' name = '__cat_subcats' id = '__cat_subcats' class = 'form-control' />
    </div>
    <div class="list-group __sortable-list" id = '__sl-main-group'>
    </div>
  </div>
</div>
