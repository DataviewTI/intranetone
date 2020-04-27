  <form action = '/admin/category/create' id='category-form' method = 'post' class = 'form-fit'>
  @component('IntranetOne::io.components.wizard',[
    "_id" => "category-wizard",
    "_min_height"=>"435px",
    "_steps"=> [
        ["name" => "Dados Gerais", "view"=> "IntranetOne::io.services.categories.form"],
      ]
  ])
  @endcomponent
</form>