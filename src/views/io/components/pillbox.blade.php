			<div class="pillbox" id="{{$_id}}">
				<ul class="clearfix pill-group">
					<li class="pillbox-input-wrap btn-group">
						<a class="pillbox-more">and <span class="pillbox-more-count"></span> more...</a>
						<input type="text" class="form-control form-control-lg dropdown-toggle pillbox-add-item" placeholder="Adicionar...">
						<button type="button" class="dropdown-toggle sr-only">
							<span class="caret"></span>
							<span class="sr-only">Toggle Dropdown</span>
						</button>
						<ul class="suggest dropdown-menu" role="menu" data-toggle="dropdown" data-flip="auto"></ul>
					</li>
				</ul>
				<input type = 'hidden' name = '__{{$_id}}' id = '__{{$_id}}'>
			</div>
