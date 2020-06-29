	<div class="custom-dz-template position-relative dz-preview dz-file-preview">
		<div class = 'dz-buttons-container position-relative d-flex w-100 justify-content-end'>
		</div>
		<div class="dz-img-container dz-img-loading d-flex">
			<img class = 'm-auto' data-dz-thumbnail style="width:100%"/>
		</div>
		<div class = 'dz-container-infos w-100'>
      <div class="progress d-flex d-none">
        <div class="progress-bar progress-bar-striped bg-info progress-bar-animated" role="progressbar" style="width:0" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
          <span class='progress-value'></span>
        </div>
      </div>
      <div class = 'dz-info-container d-none' style = 'overflow:hidden!important'>
        <span class="dz-info dz-info-file-name float-left" data-dz-name></span>
        <span class="dz-info dz-info-file-size invisible" data-dz-size></span>
        <span class="dz-info dz-info-percent float-right" data-dz-percent> </span>
        {{-- <input type = 'hidden' data-dz-embed-data> --}}
      </div>
      <strong class="error text-danger" data-dz-errormessage></strong>
    </div>
	</div>
