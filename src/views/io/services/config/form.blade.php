<form action = '/admin/popup/create' id='default-form' method = 'post' class = 'form-fit'>
  @component('IntranetOne::io.components.wizard',[
    "_id" => "default-wizard",
    "_min_height"=>"435px",
    "_steps"=> [
        ["name" => "Dados Gerais", "view"=> "Popup::form-general"],
        ["name" => "Video","view"=> "IntranetOne::io.forms.form-video"],
      ]
  ])
  @endcomponent
</form>