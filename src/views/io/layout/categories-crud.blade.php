@php
	$serviceMainCat = Dataview\IntranetOne\Category::select('id','category','category_id')
	->where('category',$cat)
	->get();

	echo "<script>"
		."var serviceMainCat = ".json_encode($serviceMainCat[0]).";"
		."</script>";
@endphp

<button id="new-category" class="btn btn-success"><i class="ico ico-plus"></i> Nova categoria</button>

@component('IntranetOne::io.components.datatable',[
	"_id" => "categories-table",
	"_columns"=> [
			["title" => "#"],
			["title" => "Categoria"],
			["title" => "Categoria pai"],
			["title" => "Descrição"],
			["title" => "Ações"],
		]
	])
@endcomponent

<div id="categories-crud-modal" class="modal fade" tabindex="-1" role="dialog">
	<div class="modal-dialog" role="document">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title">Criar/Alterar categoria</h5>
				<button type="button" class="close" data-dismiss="modal" aria-label="Close">
				<span aria-hidden="true">&times;</span>
				</button>
			</div>
			<div class="modal-body">
				<form id="category-form">
					<input class="form-control" type="hidden" id="edit" name="edit" value="-1">
					<div class="form-group">
						<label for="category">Nome da categoria</label>
						<input type="email" class="form-control" id="category" name="category" aria-describedby="emailHelp" required>
					</div>
					<div class="form-group">
						<label for="category_id">Categoria pai</label>
						<select class="form-control" id="category_id" name="category_id">
						</select>
					</div>
					<div class="form-group">
						<label for="description">Descrição</label>
						<textarea class="form-control" rows="4" id="description" name="description"></textarea>
					</div>
				</form>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
				<button id="save-category" type="button" class="btn btn-primary">Salvar</button>
			</div>
		</div>
	</div>
</div>
