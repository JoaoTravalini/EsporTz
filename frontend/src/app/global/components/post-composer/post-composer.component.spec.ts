import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { PostComposerComponent } from './post-composer.component';

describe('PostComposerComponent', () => {
  let component: PostComposerComponent;
  let fixture: ComponentFixture<PostComposerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostComposerComponent],
      imports: [FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(PostComposerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit trimmed content on submit', () => {
    spyOn(component.submitPost, 'emit');
    component.postContent = '  hello world  ';

    component.handleSubmit();

    expect(component.submitPost.emit).toHaveBeenCalledWith(
      jasmine.objectContaining({ content: 'hello world', workoutActivityIds: undefined })
    );
    expect(component.postContent).toBe('');
    expect(component.isExpanded).toBeFalse();
  });

  it('should reset state on cancel', () => {
    component.postContent = 'draft';
    component.isExpanded = true;

    component.handleCancel();

    expect(component.postContent).toBe('');
    expect(component.isExpanded).toBeFalse();
  });
});
