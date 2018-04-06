	<div class="custom-dz-template mt-1">
		<div class = 'dz-buttons-container d-flex justify-content-end'>
        <span class="dv-btn-circle dz-delete invisible bg-danger text-white" data-dz-delete="" data-toggle='tooltip' data-placement='top' title='Remover'>
        <i class = 'ico ico-trash'></i>
        </span>
			<span class="dv-btn-circle dz-reorder invisible mx-1 bg-info text-white" data-dz-reorder data-toggle='tooltip' data-placement='top' title='Mover'>
				  <i class = 'ico ico-move'></i>
        </span>
			<span class="dv-btn-circle dz-edit invisible bg-warning text-white mr-1" data-toggle='tooltip' data-placement='top' title='Editar'>
				<i class = 'ico ico-edit'></i>
      </span>
			<span class="dv-btn-circle dz-cancel mr-1 bg-danger text-white" data-toggle='tooltip' data-placement='top' title='cancelar upload'>
				<i class = 'ico ico-close'></i>
      </span>
		</div>
		<div class="dz-img-container dz-img-loading">
			<img class = 'img-fluid' data-dz-thumbnail />
		</div>
		<div class = 'dz-container-infos'>
      <div class="progress">
        <div class="progress-bar progress-bar-animated progress-bar-striped bg-danger" role="progressbar" style="width:0" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
      </div>
      <div class = 'dz-info-container'>
        <span class="dz-info dz-info-file-name float-left" data-dz-name></span>
        <span class="dz-info dz-info-file-size invisible" data-dz-size></span>
        <span class="dz-info dz-info-percent float-right" data-dz-percent> </span>
        <input type = 'hidden' data-dz-embed-data>
      </div>
      <strong class="error text-danger" data-dz-errormessage></strong>
    </div>
	</div>
